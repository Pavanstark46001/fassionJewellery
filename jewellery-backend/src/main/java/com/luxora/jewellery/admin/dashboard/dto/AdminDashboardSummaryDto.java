package com.luxora.jewellery.admin.dashboard.dto;

import com.luxora.jewellery.admin.order.dto.AdminOrderSummaryDto;
import com.luxora.jewellery.order.entity.OrderStatus;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public record AdminDashboardSummaryDto(
        long totalProducts,
        long totalCustomers,
        long totalOrders,
        BigDecimal totalRevenue,
        Map<OrderStatus, Long> ordersByStatus,
        List<AdminOrderSummaryDto> recentOrders
) {
}
