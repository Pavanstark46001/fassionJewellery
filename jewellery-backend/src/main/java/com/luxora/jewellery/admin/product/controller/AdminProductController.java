package com.luxora.jewellery.admin.product.controller;

import com.luxora.jewellery.admin.product.dto.AdminProductRequest;
import com.luxora.jewellery.admin.product.service.AdminProductService;
import com.luxora.jewellery.common.dto.ApiResponse;
import com.luxora.jewellery.common.dto.PageResponse;
import com.luxora.jewellery.product.dto.ProductDetailDto;
import com.luxora.jewellery.product.dto.ProductSummaryDto;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@Tag(name = "Admin - Products", description = "Admin-only product ('ornament') management (ROLE_ADMIN)")
@RestController
@RequestMapping("/api/v1/admin/products")
@RequiredArgsConstructor
public class AdminProductController {

    private final AdminProductService adminProductService;

    @GetMapping
    public ApiResponse<PageResponse<ProductSummaryDto>> list(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String categorySlug,
            @RequestParam(required = false) Boolean isActive,
            Pageable pageable) {
        return ApiResponse.ok(adminProductService.listProducts(q, categorySlug, isActive, pageable));
    }

    @GetMapping("/{id}")
    public ApiResponse<ProductDetailDto> get(@PathVariable UUID id) {
        return ApiResponse.ok(adminProductService.getProduct(id));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ProductDetailDto>> create(@Valid @RequestBody AdminProductRequest request) {
        ProductDetailDto created = adminProductService.createProduct(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Product created", created));
    }

    @PutMapping("/{id}")
    public ApiResponse<ProductDetailDto> update(@PathVariable UUID id, @Valid @RequestBody AdminProductRequest request) {
        return ApiResponse.ok("Product updated", adminProductService.updateProduct(id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable UUID id) {
        adminProductService.deleteProduct(id);
        return ApiResponse.ok("Product deleted", null);
    }
}
