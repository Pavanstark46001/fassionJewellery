package com.luxora.jewellery.product.service;

import com.luxora.jewellery.common.dto.PageResponse;
import com.luxora.jewellery.common.exception.ResourceNotFoundException;
import com.luxora.jewellery.product.dto.ProductDetailDto;
import com.luxora.jewellery.product.dto.ProductFilterRequest;
import com.luxora.jewellery.product.dto.ProductImageDto;
import com.luxora.jewellery.product.dto.ProductSummaryDto;
import com.luxora.jewellery.product.entity.Product;
import com.luxora.jewellery.product.entity.ProductImage;
import com.luxora.jewellery.product.mapper.ProductMapper;
import com.luxora.jewellery.product.repository.ProductCollectionRepository;
import com.luxora.jewellery.product.repository.ProductImageRepository;
import com.luxora.jewellery.product.repository.ProductOccasionRepository;
import com.luxora.jewellery.product.repository.ProductRepository;
import com.luxora.jewellery.product.specification.ProductSpecifications;
import com.luxora.jewellery.review.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductService {

    private static final int RELATED_PRODUCTS_LIMIT = 8;

    private final ProductRepository productRepository;
    private final ProductImageRepository productImageRepository;
    private final ProductCollectionRepository productCollectionRepository;
    private final ProductOccasionRepository productOccasionRepository;
    private final ReviewRepository reviewRepository;
    private final ProductMapper productMapper;

    public PageResponse<ProductSummaryDto> searchProducts(ProductFilterRequest filter, Pageable pageable) {
        Specification<Product> spec = Specification.allOf(
                ProductSpecifications.isActive(),
                ProductSpecifications.isFeatured(filter.featured()),
                ProductSpecifications.hasCategorySlug(filter.categorySlug()),
                ProductSpecifications.hasSubCategorySlug(filter.subCategorySlug()),
                ProductSpecifications.hasMetalType(filter.metalType()),
                ProductSpecifications.priceGreaterThanOrEqual(filter.minPrice()),
                ProductSpecifications.priceLessThanOrEqual(filter.maxPrice()),
                ProductSpecifications.nameContains(filter.q()),
                ProductSpecifications.inCollectionSlug(filter.collectionSlug()),
                ProductSpecifications.inOccasionSlug(filter.occasionSlug())
        );

        Page<Product> page = productRepository.findAll(spec, pageable);
        List<ProductSummaryDto> content = toSummaryDtos(page.getContent());
        return PageResponse.from(page, content);
    }

    public PageResponse<ProductSummaryDto> getProductsByCollectionSlug(String collectionSlug, Pageable pageable) {
        return searchProducts(new ProductFilterRequest(null, null, collectionSlug, null, null, null, null, null, null),
                pageable);
    }

    public PageResponse<ProductSummaryDto> getProductsByOccasionSlug(String occasionSlug, Pageable pageable) {
        return searchProducts(new ProductFilterRequest(null, null, null, occasionSlug, null, null, null, null, null),
                pageable);
    }

    @Cacheable(value = "products", key = "'slug:' + #slug")
    public ProductDetailDto getProductBySlug(String slug) {
        Product product = productRepository.findBySlugAndIsActiveTrue(slug)
                .orElseThrow(() -> ResourceNotFoundException.of("Product", "slug", slug));
        return toDetailDto(product);
    }

    @Cacheable(value = "products", key = "'ornamentId:' + #ornamentId")
    public ProductDetailDto getProductByOrnamentId(String ornamentId) {
        Product product = productRepository.findByOrnamentIdAndIsActiveTrue(ornamentId)
                .orElseThrow(() -> ResourceNotFoundException.of("Product", "ornamentId", ornamentId));
        return toDetailDto(product);
    }

    /**
     * Used by the CMS home-section resolver to turn a bare product id
     * referenced from a {@code home_section_items} row into a full summary.
     */
    public ProductSummaryDto getProductSummaryById(UUID id) {
        Product product = productRepository.findById(id)
                .filter(Product::isActive)
                .orElseThrow(() -> ResourceNotFoundException.of("Product", "id", id));
        String primaryImageUrl = productImageRepository.findByProduct_IdOrderByDisplayOrderAsc(product.getId())
                .stream()
                .min(Comparator.comparing(ProductImage::isPrimary).reversed()
                        .thenComparing(img -> img.getDisplayOrder() == null ? 0 : img.getDisplayOrder()))
                .map(ProductImage::getImageUrl)
                .orElse(null);
        return productMapper.toSummaryDto(product, primaryImageUrl);
    }

    /**
     * Batch-resolves active products into summaries, keyed by product id.
     * Used by cart/wishlist to render line items without N+1 queries; ids
     * that don't resolve to an active product (deleted/deactivated since
     * being added) are simply omitted from the result.
     */
    public Map<UUID, ProductSummaryDto> getProductSummaryMapByIds(List<UUID> ids) {
        if (ids.isEmpty()) {
            return Map.of();
        }
        List<Product> products = productRepository.findAllById(ids).stream()
                .filter(Product::isActive)
                .toList();
        return toSummaryDtos(products).stream()
                .collect(Collectors.toMap(ProductSummaryDto::id, dto -> dto));
    }

    /**
     * Up to {@value #RELATED_PRODUCTS_LIMIT} other active products sharing
     * this product's category or any of its collections, excluding the
     * product itself, ordered featured-first then newest.
     */
    public List<ProductSummaryDto> getRelatedProducts(String slug) {
        Product product = productRepository.findBySlugAndIsActiveTrue(slug)
                .orElseThrow(() -> ResourceNotFoundException.of("Product", "slug", slug));

        UUID categoryId = product.getCategory() != null ? product.getCategory().getId() : null;
        List<UUID> collectionIds = productCollectionRepository.findByProduct_Id(product.getId()).stream()
                .map(pc -> pc.getCollection().getId())
                .toList();

        Specification<Product> spec = Specification.allOf(
                ProductSpecifications.isActive(),
                ProductSpecifications.isRelatedTo(product.getId(), categoryId, collectionIds));

        Pageable pageable = PageRequest.of(0, RELATED_PRODUCTS_LIMIT,
                Sort.by(Sort.Order.desc("isFeatured"), Sort.Order.desc("createdDate")));

        Page<Product> page = productRepository.findAll(spec, pageable);
        return toSummaryDtos(page.getContent());
    }

    private List<ProductSummaryDto> toSummaryDtos(List<Product> products) {
        if (products.isEmpty()) {
            return List.of();
        }
        List<UUID> productIds = products.stream().map(Product::getId).toList();
        Map<UUID, String> primaryImageByProductId = productImageRepository
                .findByProduct_IdInOrderByDisplayOrderAsc(productIds).stream()
                .collect(Collectors.groupingBy(
                        img -> img.getProduct().getId(),
                        Collectors.collectingAndThen(
                                Collectors.minBy(Comparator.comparing(ProductImage::isPrimary).reversed()
                                        .thenComparing(img -> img.getDisplayOrder() == null ? 0 : img.getDisplayOrder())),
                                opt -> opt.map(ProductImage::getImageUrl).orElse(null))
                ));

        return products.stream()
                .map(product -> productMapper.toSummaryDto(product, primaryImageByProductId.get(product.getId())))
                .toList();
    }

    private ProductDetailDto toDetailDto(Product product) {
        List<ProductImageDto> images = productImageRepository
                .findByProduct_IdOrderByDisplayOrderAsc(product.getId()).stream()
                .map(productMapper::toImageDto)
                .toList();

        List<String> collectionSlugs = productCollectionRepository.findByProduct_Id(product.getId()).stream()
                .map(pc -> pc.getCollection().getSlug())
                .toList();

        List<String> occasionSlugs = productOccasionRepository.findByProduct_Id(product.getId()).stream()
                .map(po -> po.getOccasion().getSlug())
                .toList();

        Double averageRating = reviewRepository.findAverageRatingByProductId(product.getId());
        int reviewCount = (int) reviewRepository.countByProductId(product.getId());

        return productMapper.toDetailDto(product, images, collectionSlugs, occasionSlugs, averageRating, reviewCount);
    }
}
