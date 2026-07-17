package com.luxora.jewellery.admin.product.service;

import com.luxora.jewellery.admin.product.dto.AdminProductImageRequest;
import com.luxora.jewellery.admin.product.dto.AdminProductRequest;
import com.luxora.jewellery.category.entity.Category;
import com.luxora.jewellery.category.entity.SubCategory;
import com.luxora.jewellery.category.repository.CategoryRepository;
import com.luxora.jewellery.category.repository.SubCategoryRepository;
import com.luxora.jewellery.collection.entity.Collection;
import com.luxora.jewellery.collection.repository.CollectionRepository;
import com.luxora.jewellery.common.dto.PageResponse;
import com.luxora.jewellery.common.exception.ResourceNotFoundException;
import com.luxora.jewellery.common.util.UniqueSlugResolver;
import com.luxora.jewellery.occasion.entity.Occasion;
import com.luxora.jewellery.occasion.repository.OccasionRepository;
import com.luxora.jewellery.product.dto.ProductDetailDto;
import com.luxora.jewellery.product.dto.ProductImageDto;
import com.luxora.jewellery.product.dto.ProductSummaryDto;
import com.luxora.jewellery.product.entity.Product;
import com.luxora.jewellery.product.entity.ProductCollection;
import com.luxora.jewellery.product.entity.ProductImage;
import com.luxora.jewellery.product.entity.ProductOccasion;
import com.luxora.jewellery.product.entity.StockStatus;
import com.luxora.jewellery.product.mapper.ProductMapper;
import com.luxora.jewellery.product.repository.ProductCollectionRepository;
import com.luxora.jewellery.product.repository.ProductImageRepository;
import com.luxora.jewellery.product.repository.ProductOccasionRepository;
import com.luxora.jewellery.product.repository.ProductRepository;
import com.luxora.jewellery.product.specification.ProductSpecifications;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Admin-only counterpart to {@link com.luxora.jewellery.product.service.ProductService}:
 * full CRUD over {@code Product} (including inactive/out-of-stock rows the
 * public storefront never returns), reusing the same entities/repositories
 * rather than duplicating the domain model.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminProductService {

    private static final String ORNAMENT_PREFIX = "ORN-";

    private final ProductRepository productRepository;
    private final ProductImageRepository productImageRepository;
    private final ProductCollectionRepository productCollectionRepository;
    private final ProductOccasionRepository productOccasionRepository;
    private final CategoryRepository categoryRepository;
    private final SubCategoryRepository subCategoryRepository;
    private final CollectionRepository collectionRepository;
    private final OccasionRepository occasionRepository;
    private final ProductMapper productMapper;

    public PageResponse<ProductSummaryDto> listProducts(String q, String categorySlug, Boolean isActive,
                                                          Pageable pageable) {
        Specification<Product> spec = Specification.allOf(
                ProductSpecifications.hasIsActive(isActive),
                ProductSpecifications.hasCategorySlug(categorySlug),
                ProductSpecifications.nameContains(q));

        Page<Product> page = productRepository.findAll(spec, pageable);
        return PageResponse.from(page, toSummaryDtos(page.getContent()));
    }

    public ProductDetailDto getProduct(UUID id) {
        return toDetailDto(findProduct(id));
    }

    @Transactional
    @CacheEvict(value = "products", allEntries = true)
    public ProductDetailDto createProduct(AdminProductRequest request) {
        Product product = new Product();
        product.setOrnamentId(generateOrnamentId());
        applyRequest(product, request);
        product = productRepository.save(product);

        replaceImages(product, request.images());
        replaceCollections(product, request.collectionIds());
        replaceOccasions(product, request.occasionIds());
        return toDetailDto(product);
    }

    @Transactional
    @CacheEvict(value = "products", allEntries = true)
    public ProductDetailDto updateProduct(UUID id, AdminProductRequest request) {
        Product product = findProduct(id);
        applyRequest(product, request);
        product = productRepository.save(product);

        replaceImages(product, request.images());
        replaceCollections(product, request.collectionIds());
        replaceOccasions(product, request.occasionIds());
        return toDetailDto(product);
    }

    @Transactional
    @CacheEvict(value = "products", allEntries = true)
    public void deleteProduct(UUID id) {
        productRepository.delete(findProduct(id));
    }

    private Product findProduct(UUID id) {
        return productRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Product", "id", id));
    }

    private void applyRequest(Product product, AdminProductRequest request) {
        Category category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> ResourceNotFoundException.of("Category", "id", request.categoryId()));
        SubCategory subCategory = null;
        if (request.subCategoryId() != null) {
            subCategory = subCategoryRepository.findById(request.subCategoryId())
                    .orElseThrow(() -> ResourceNotFoundException.of("SubCategory", "id", request.subCategoryId()));
        }

        product.setName(request.name());
        product.setSlug(UniqueSlugResolver.resolve(request.slug(), request.name(), product.getId(),
                productRepository::findBySlug));
        product.setShortDescription(request.shortDescription());
        product.setDescription(request.description());
        product.setBasePrice(request.basePrice());
        product.setDiscountedPrice(request.discountedPrice());
        product.setMetalType(request.metalType());
        product.setWeightGrams(request.weightGrams());
        product.setCategory(category);
        product.setSubCategory(subCategory);
        product.setActive(request.isActive() == null || request.isActive());
        product.setFeatured(Boolean.TRUE.equals(request.isFeatured()));
        product.setStockStatus(request.stockStatus() == null ? StockStatus.IN_STOCK : request.stockStatus());
        product.setMetaTitle(request.metaTitle());
        product.setMetaDescription(request.metaDescription());
    }

    private String generateOrnamentId() {
        long nextSeq = productRepository.findMaxOrnamentSuffix() + 1;
        return ORNAMENT_PREFIX + "%06d".formatted(nextSeq);
    }

    private void replaceImages(Product product, List<AdminProductImageRequest> images) {
        List<ProductImage> existing = productImageRepository.findByProduct_IdOrderByDisplayOrderAsc(product.getId());
        if (!existing.isEmpty()) {
            productImageRepository.deleteAll(existing);
        }
        if (images == null || images.isEmpty()) {
            return;
        }
        List<ProductImage> newImages = images.stream()
                .map(img -> {
                    ProductImage built = ProductImage.builder()
                            .product(product)
                            .imageUrl(img.imageUrl())
                            .altText(img.altText())
                            .displayOrder(img.displayOrder() == null ? 0 : img.displayOrder())
                            .isPrimary(img.isPrimary())
                            .build();
                    return built;
                })
                .toList();
        productImageRepository.saveAll(newImages);
    }

    private void replaceCollections(Product product, List<UUID> collectionIds) {
        List<ProductCollection> existing = productCollectionRepository.findByProduct_Id(product.getId());
        if (!existing.isEmpty()) {
            productCollectionRepository.deleteAll(existing);
        }
        if (collectionIds == null || collectionIds.isEmpty()) {
            return;
        }
        List<ProductCollection> rows = collectionIds.stream().distinct()
                .map(collectionId -> {
                    Collection collection = collectionRepository.findById(collectionId)
                            .orElseThrow(() -> ResourceNotFoundException.of("Collection", "id", collectionId));
                    ProductCollection built = ProductCollection.builder().product(product).collection(collection).build();
                    return built;
                })
                .toList();
        productCollectionRepository.saveAll(rows);
    }

    private void replaceOccasions(Product product, List<UUID> occasionIds) {
        List<ProductOccasion> existing = productOccasionRepository.findByProduct_Id(product.getId());
        if (!existing.isEmpty()) {
            productOccasionRepository.deleteAll(existing);
        }
        if (occasionIds == null || occasionIds.isEmpty()) {
            return;
        }
        List<ProductOccasion> rows = occasionIds.stream().distinct()
                .map(occasionId -> {
                    Occasion occasion = occasionRepository.findById(occasionId)
                            .orElseThrow(() -> ResourceNotFoundException.of("Occasion", "id", occasionId));
                    ProductOccasion built = ProductOccasion.builder().product(product).occasion(occasion).build();
                    return built;
                })
                .toList();
        productOccasionRepository.saveAll(rows);
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
                                opt -> opt.map(ProductImage::getImageUrl).orElse(null))));

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
        // Review stats aren't relevant to the admin edit view; the shared
        // ProductMapper#toDetailDto signature just takes null/0 for them.
        return productMapper.toDetailDto(product, images, collectionSlugs, occasionSlugs, null, 0);
    }
}
