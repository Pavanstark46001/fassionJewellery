package com.luxora.jewellery.product.mapper;

import com.luxora.jewellery.product.dto.ProductDetailDto;
import com.luxora.jewellery.product.dto.ProductImageDto;
import com.luxora.jewellery.product.dto.ProductSummaryDto;
import com.luxora.jewellery.product.entity.Product;
import com.luxora.jewellery.product.entity.ProductImage;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ProductMapper {

    @Mapping(target = "categoryName", source = "product.category.name")
    @Mapping(target = "categorySlug", source = "product.category.slug")
    @Mapping(target = "primaryImageUrl", source = "primaryImageUrl")
    @Mapping(target = "isFeatured", source = "product.featured")
    ProductSummaryDto toSummaryDto(Product product, String primaryImageUrl);

    @Mapping(target = "categoryId", source = "product.category.id")
    @Mapping(target = "categoryName", source = "product.category.name")
    @Mapping(target = "categorySlug", source = "product.category.slug")
    @Mapping(target = "subCategoryId", source = "product.subCategory.id")
    @Mapping(target = "subCategoryName", source = "product.subCategory.name")
    @Mapping(target = "subCategorySlug", source = "product.subCategory.slug")
    @Mapping(target = "isActive", source = "product.active")
    @Mapping(target = "isFeatured", source = "product.featured")
    @Mapping(target = "images", source = "images")
    @Mapping(target = "collectionSlugs", source = "collectionSlugs")
    @Mapping(target = "occasionSlugs", source = "occasionSlugs")
    @Mapping(target = "averageRating", source = "averageRating")
    @Mapping(target = "reviewCount", source = "reviewCount")
    ProductDetailDto toDetailDto(Product product, List<ProductImageDto> images,
                                  List<String> collectionSlugs, List<String> occasionSlugs,
                                  Double averageRating, int reviewCount);

    @Mapping(target = "isPrimary", source = "primary")
    ProductImageDto toImageDto(ProductImage image);
}
