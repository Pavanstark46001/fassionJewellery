package com.luxora.jewellery.admin.order.controller;

import com.luxora.jewellery.admin.order.dto.AdminOrderDetailDto;
import com.luxora.jewellery.admin.order.dto.AdminOrderStatusUpdateRequest;
import com.luxora.jewellery.admin.order.dto.AdminOrderSummaryDto;
import com.luxora.jewellery.admin.order.service.AdminOrderService;
import com.luxora.jewellery.common.dto.ApiResponse;
import com.luxora.jewellery.common.dto.PageResponse;
import com.luxora.jewellery.order.entity.OrderStatus;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Admin - Orders", description = "Admin-only order management across all customers (ROLE_ADMIN)")
@RestController
@RequestMapping("/api/v1/admin/orders")
@RequiredArgsConstructor
public class AdminOrderController {

    private final AdminOrderService adminOrderService;

    @GetMapping
    public ApiResponse<PageResponse<AdminOrderSummaryDto>> list(
            @RequestParam(required = false) OrderStatus status, Pageable pageable) {
        return ApiResponse.ok(adminOrderService.listOrders(status, pageable));
    }

    @GetMapping("/{orderNumber}")
    public ApiResponse<AdminOrderDetailDto> get(@PathVariable String orderNumber) {
        return ApiResponse.ok(adminOrderService.getOrder(orderNumber));
    }

    @PatchMapping("/{orderNumber}/status")
    public ApiResponse<AdminOrderDetailDto> updateStatus(
            @PathVariable String orderNumber, @Valid @RequestBody AdminOrderStatusUpdateRequest request) {
        return ApiResponse.ok("Order status updated", adminOrderService.updateStatus(orderNumber, request.status()));
    }
}
