package com.luxora.jewellery.admin.dashboard.controller;

import com.luxora.jewellery.admin.dashboard.dto.AdminDashboardSummaryDto;
import com.luxora.jewellery.admin.dashboard.service.AdminDashboardService;
import com.luxora.jewellery.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Admin - Dashboard", description = "Admin-only back-office summary (ROLE_ADMIN)")
@RestController
@RequestMapping("/api/v1/admin/dashboard")
@RequiredArgsConstructor
public class AdminDashboardController {

    private final AdminDashboardService adminDashboardService;

    @GetMapping("/summary")
    public ApiResponse<AdminDashboardSummaryDto> summary() {
        return ApiResponse.ok(adminDashboardService.getSummary());
    }
}
