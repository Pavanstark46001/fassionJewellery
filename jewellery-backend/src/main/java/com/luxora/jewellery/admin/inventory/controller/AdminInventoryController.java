package com.luxora.jewellery.admin.inventory.controller;

import com.luxora.jewellery.admin.inventory.dto.AdminProductInventoryDto;
import com.luxora.jewellery.admin.inventory.dto.InventoryLocationRequest;
import com.luxora.jewellery.admin.inventory.dto.StockMovementDto;
import com.luxora.jewellery.admin.inventory.dto.StockMovementRequest;
import com.luxora.jewellery.admin.inventory.service.AdminInventoryService;
import com.luxora.jewellery.common.dto.ApiResponse;
import com.luxora.jewellery.common.dto.PageResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

/**
 * Admin-only real inventory tracking (ROLE_ADMIN, guarded by the blanket
 * {@code /api/v1/admin/**} rule in {@code SecurityConfig}). Sprint 8.
 */
@Tag(name = "Admin - Inventory", description = "Admin-only stock quantity/location tracking (ROLE_ADMIN)")
@RestController
@RequestMapping("/api/v1/admin/inventory")
@RequiredArgsConstructor
public class AdminInventoryController {

    private final AdminInventoryService adminInventoryService;

    @GetMapping("/products")
    public ApiResponse<PageResponse<AdminProductInventoryDto>> listProducts(
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "false") boolean lowStockOnly,
            Pageable pageable) {
        return ApiResponse.ok(adminInventoryService.listInventory(q, lowStockOnly, pageable));
    }

    @PutMapping("/products/{id}/location")
    public ApiResponse<AdminProductInventoryDto> setLocation(@PathVariable UUID id,
                                                               @RequestBody InventoryLocationRequest request) {
        return ApiResponse.ok("Location updated", adminInventoryService.setLocation(id, request));
    }

    @PostMapping("/movements")
    public ResponseEntity<ApiResponse<StockMovementDto>> recordMovement(
            @Valid @RequestBody StockMovementRequest request) {
        StockMovementDto movement = adminInventoryService.recordMovement(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Movement recorded", movement));
    }

    @GetMapping("/movements")
    public ApiResponse<PageResponse<StockMovementDto>> listMovements(
            @RequestParam(required = false) UUID productId,
            Pageable pageable) {
        return ApiResponse.ok(adminInventoryService.listMovements(productId, pageable));
    }
}
