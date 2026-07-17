package com.luxora.jewellery.product.controller;

import com.luxora.jewellery.common.dto.ApiResponse;
import com.luxora.jewellery.common.dto.PageResponse;
import com.luxora.jewellery.product.dto.ProductDetailDto;
import com.luxora.jewellery.product.dto.ProductFilterRequest;
import com.luxora.jewellery.product.dto.ProductSummaryDto;
import com.luxora.jewellery.product.entity.MetalType;
import com.luxora.jewellery.product.service.ProductService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.List;

@Tag(name = "Products", description = "Public product ('ornament') catalog browsing and search")
@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public ApiResponse<PageResponse<ProductSummaryDto>> search(
            @RequestParam(required = false) String categorySlug,
            @RequestParam(required = false) String subCategorySlug,
            @RequestParam(required = false) String collectionSlug,
            @RequestParam(required = false) String occasionSlug,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) MetalType metalType,
            @RequestParam(required = false) Boolean featured,
            @RequestParam(required = false) String q,
            Pageable pageable) {
        ProductFilterRequest filter = new ProductFilterRequest(categorySlug, subCategorySlug, collectionSlug,
                occasionSlug, minPrice, maxPrice, metalType, featured, q);
        return ApiResponse.ok(productService.searchProducts(filter, pageable));
    }

    @GetMapping("/{slug}")
    public ApiResponse<ProductDetailDto> getBySlug(@PathVariable String slug) {
        return ApiResponse.ok(productService.getProductBySlug(slug));
    }

    @GetMapping("/ornament/{ornamentId}")
    public ApiResponse<ProductDetailDto> getByOrnamentId(@PathVariable String ornamentId) {
        return ApiResponse.ok(productService.getProductByOrnamentId(ornamentId));
    }

    @GetMapping("/{slug}/related")
    public ApiResponse<List<ProductSummaryDto>> getRelated(@PathVariable String slug) {
        return ApiResponse.ok(productService.getRelatedProducts(slug));
    }
}
