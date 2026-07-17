package com.luxora.jewellery.occasion.controller;

import com.luxora.jewellery.common.dto.ApiResponse;
import com.luxora.jewellery.common.dto.PageResponse;
import com.luxora.jewellery.occasion.dto.OccasionDto;
import com.luxora.jewellery.occasion.service.OccasionService;
import com.luxora.jewellery.product.dto.ProductSummaryDto;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Tag(name = "Occasions", description = "Occasion-based browsing (Wedding, Festival, Daily Wear, ...)")
@RestController
@RequestMapping("/api/v1/occasions")
@RequiredArgsConstructor
public class OccasionController {

    private final OccasionService occasionService;

    @GetMapping
    public ApiResponse<List<OccasionDto>> getOccasions() {
        return ApiResponse.ok(occasionService.getOccasions());
    }

    @GetMapping("/{slug}/products")
    public ApiResponse<PageResponse<ProductSummaryDto>> getProducts(@PathVariable String slug, Pageable pageable) {
        return ApiResponse.ok(occasionService.getProductsByOccasionSlug(slug, pageable));
    }
}
