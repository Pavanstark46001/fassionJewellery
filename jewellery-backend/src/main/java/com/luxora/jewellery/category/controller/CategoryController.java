package com.luxora.jewellery.category.controller;

import com.luxora.jewellery.category.dto.CategoryDto;
import com.luxora.jewellery.category.dto.SubCategoryDto;
import com.luxora.jewellery.category.service.CategoryService;
import com.luxora.jewellery.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Tag(name = "Categories", description = "Public catalog category browsing")
@RestController
@RequestMapping("/api/v1/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    public ApiResponse<List<CategoryDto>> getCategories(
            @RequestParam(name = "activeOnly", defaultValue = "true") boolean activeOnly) {
        return ApiResponse.ok(categoryService.getCategories(activeOnly));
    }

    @GetMapping("/{slug}")
    public ApiResponse<CategoryDto> getCategoryBySlug(@PathVariable String slug) {
        return ApiResponse.ok(categoryService.getCategoryBySlug(slug));
    }

    @GetMapping("/{slug}/subcategories")
    public ApiResponse<List<SubCategoryDto>> getSubCategories(@PathVariable String slug) {
        return ApiResponse.ok(categoryService.getSubCategoriesByCategorySlug(slug));
    }
}
