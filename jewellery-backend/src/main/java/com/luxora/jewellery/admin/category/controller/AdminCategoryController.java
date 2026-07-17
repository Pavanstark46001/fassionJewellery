package com.luxora.jewellery.admin.category.controller;

import com.luxora.jewellery.admin.category.dto.AdminCategoryRequest;
import com.luxora.jewellery.admin.category.dto.AdminSubCategoryRequest;
import com.luxora.jewellery.admin.category.service.AdminCategoryService;
import com.luxora.jewellery.category.dto.CategoryDto;
import com.luxora.jewellery.category.dto.SubCategoryDto;
import com.luxora.jewellery.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@Tag(name = "Admin - Categories", description = "Admin-only category/sub-category management (ROLE_ADMIN)")
@RestController
@RequestMapping("/api/v1/admin/categories")
@RequiredArgsConstructor
public class AdminCategoryController {

    private final AdminCategoryService adminCategoryService;

    @GetMapping
    public ApiResponse<List<CategoryDto>> list() {
        return ApiResponse.ok(adminCategoryService.listAll());
    }

    @GetMapping("/{id}")
    public ApiResponse<CategoryDto> get(@PathVariable UUID id) {
        return ApiResponse.ok(adminCategoryService.get(id));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CategoryDto>> create(@Valid @RequestBody AdminCategoryRequest request) {
        CategoryDto created = adminCategoryService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Category created", created));
    }

    @PutMapping("/{id}")
    public ApiResponse<CategoryDto> update(@PathVariable UUID id, @Valid @RequestBody AdminCategoryRequest request) {
        return ApiResponse.ok("Category updated", adminCategoryService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable UUID id) {
        adminCategoryService.delete(id);
        return ApiResponse.ok("Category deleted", null);
    }

    @GetMapping("/{categoryId}/subcategories")
    public ApiResponse<List<SubCategoryDto>> listSubCategories(@PathVariable UUID categoryId) {
        return ApiResponse.ok(adminCategoryService.listSubCategories(categoryId));
    }

    @GetMapping("/{categoryId}/subcategories/{id}")
    public ApiResponse<SubCategoryDto> getSubCategory(@PathVariable UUID categoryId, @PathVariable UUID id) {
        return ApiResponse.ok(adminCategoryService.getSubCategory(categoryId, id));
    }

    @PostMapping("/{categoryId}/subcategories")
    public ResponseEntity<ApiResponse<SubCategoryDto>> createSubCategory(
            @PathVariable UUID categoryId, @Valid @RequestBody AdminSubCategoryRequest request) {
        SubCategoryDto created = adminCategoryService.createSubCategory(categoryId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Sub-category created", created));
    }

    @PutMapping("/{categoryId}/subcategories/{id}")
    public ApiResponse<SubCategoryDto> updateSubCategory(
            @PathVariable UUID categoryId, @PathVariable UUID id, @Valid @RequestBody AdminSubCategoryRequest request) {
        return ApiResponse.ok("Sub-category updated", adminCategoryService.updateSubCategory(categoryId, id, request));
    }

    @DeleteMapping("/{categoryId}/subcategories/{id}")
    public ApiResponse<Void> deleteSubCategory(@PathVariable UUID categoryId, @PathVariable UUID id) {
        adminCategoryService.deleteSubCategory(categoryId, id);
        return ApiResponse.ok("Sub-category deleted", null);
    }
}
