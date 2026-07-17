package com.luxora.jewellery.admin.customer.controller;

import com.luxora.jewellery.admin.customer.dto.AdminCustomerDetailDto;
import com.luxora.jewellery.admin.customer.dto.AdminCustomerSummaryDto;
import com.luxora.jewellery.admin.customer.service.AdminCustomerService;
import com.luxora.jewellery.common.dto.ApiResponse;
import com.luxora.jewellery.common.dto.PageResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@Tag(name = "Admin - Customers", description = "Admin-only, read-only customer list (ROLE_ADMIN)")
@RestController
@RequestMapping("/api/v1/admin/customers")
@RequiredArgsConstructor
public class AdminCustomerController {

    private final AdminCustomerService adminCustomerService;

    @GetMapping
    public ApiResponse<PageResponse<AdminCustomerSummaryDto>> list(
            @RequestParam(required = false) String q, Pageable pageable) {
        String normalizedQ = (q == null || q.isBlank()) ? null : q.trim();
        return ApiResponse.ok(adminCustomerService.listCustomers(normalizedQ, pageable));
    }

    @GetMapping("/{userId}")
    public ApiResponse<AdminCustomerDetailDto> get(@PathVariable UUID userId, Pageable pageable) {
        return ApiResponse.ok(adminCustomerService.getCustomer(userId, pageable));
    }
}
