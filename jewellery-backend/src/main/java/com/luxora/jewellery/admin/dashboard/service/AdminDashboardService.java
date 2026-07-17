package com.luxora.jewellery.admin.dashboard.service;

import com.luxora.jewellery.admin.dashboard.dto.AdminDashboardSummaryDto;
import com.luxora.jewellery.admin.order.dto.AdminOrderSummaryDto;
import com.luxora.jewellery.admin.order.service.AdminOrderService;
import com.luxora.jewellery.order.entity.Order;
import com.luxora.jewellery.order.entity.OrderStatus;
import com.luxora.jewellery.order.repository.OrderRepository;
import com.luxora.jewellery.product.repository.ProductRepository;
import com.luxora.jewellery.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Single-endpoint admin overview: a handful of straightforward aggregate
 * queries (counts + a grouped sum), no materialized reporting table needed
 * at this scale.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminDashboardService {

    private static final int RECENT_ORDERS_LIMIT = 5;

    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final AdminOrderService adminOrderService;

    public AdminDashboardSummaryDto getSummary() {
        long totalProducts = productRepository.count();
        long totalCustomers = userRepository.count();
        long totalOrders = orderRepository.count();
        BigDecimal totalRevenue = orderRepository.sumTotalAmountExcludingStatus(OrderStatus.CANCELLED);

        Map<OrderStatus, Long> ordersByStatus = orderRepository.countGroupByStatus().stream()
                .collect(Collectors.toMap(OrderRepository.OrderStatusCount::getStatus,
                        OrderRepository.OrderStatusCount::getCount));
        for (OrderStatus status : OrderStatus.values()) {
            ordersByStatus.putIfAbsent(status, 0L);
        }

        Page<Order> recent = orderRepository.findAllByOrderByCreatedDateDesc(PageRequest.of(0, RECENT_ORDERS_LIMIT));
        List<AdminOrderSummaryDto> recentOrders = adminOrderService.toSummaries(recent.getContent());

        return new AdminDashboardSummaryDto(
                totalProducts, totalCustomers, totalOrders, totalRevenue, ordersByStatus, recentOrders);
    }
}
