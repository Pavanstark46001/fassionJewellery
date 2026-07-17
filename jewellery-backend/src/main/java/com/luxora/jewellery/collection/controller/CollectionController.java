package com.luxora.jewellery.collection.controller;

import com.luxora.jewellery.collection.dto.CollectionDto;
import com.luxora.jewellery.collection.service.CollectionService;
import com.luxora.jewellery.common.dto.ApiResponse;
import com.luxora.jewellery.common.dto.PageResponse;
import com.luxora.jewellery.product.dto.ProductSummaryDto;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Tag(name = "Collections", description = "Curated jewellery collections (Bridal, Festival, Temple, ...)")
@RestController
@RequestMapping("/api/v1/collections")
@RequiredArgsConstructor
public class CollectionController {

    private final CollectionService collectionService;

    @GetMapping
    public ApiResponse<List<CollectionDto>> getCollections(
            @RequestParam(required = false) Boolean featured) {
        return ApiResponse.ok(collectionService.getCollections(featured));
    }

    @GetMapping("/{slug}")
    public ApiResponse<CollectionDto> getBySlug(@PathVariable String slug) {
        return ApiResponse.ok(collectionService.getCollectionBySlug(slug));
    }

    @GetMapping("/{slug}/products")
    public ApiResponse<PageResponse<ProductSummaryDto>> getProducts(@PathVariable String slug, Pageable pageable) {
        return ApiResponse.ok(collectionService.getProductsByCollectionSlug(slug, pageable));
    }
}
