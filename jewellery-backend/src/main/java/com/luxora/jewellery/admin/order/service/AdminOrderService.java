package com.luxora.jewellery.admin.order.service;

import com.luxora.jewellery.admin.order.dto.AdminOrderDetailDto;
import com.luxora.jewellery.admin.order.dto.AdminOrderSummaryDto;
import com.luxora.jewellery.common.dto.PageResponse;
import com.luxora.jewellery.common.exception.ApiException;
import com.luxora.jewellery.common.exception.ResourceNotFoundException;
import com.luxora.jewellery.notification.service.NotificationService;
import com.luxora.jewellery.order.dto.OrderItemDto;
import com.luxora.jewellery.order.dto.ShippingAddressDto;
import com.luxora.jewellery.order.entity.Order;
import com.luxora.jewellery.order.entity.OrderItem;
import com.luxora.jewellery.order.entity.OrderStatus;
import com.luxora.jewellery.order.repository.OrderItemRepository;
import com.luxora.jewellery.order.repository.OrderRepository;
import com.luxora.jewellery.user.entity.User;
import com.luxora.jewellery.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.EnumSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Admin-only order management: list/view ALL users' orders (not scoped to
 * the current user like {@code OrderService}) and transition order status.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminOrderService {

    /**
     * Only these are reachable via the admin status-update endpoint - PLACED
     * is the order's starting state (never a target) and CANCELLED stays a
     * customer-or-future-admin-cancel action via the existing endpoint, not
     * this one.
     */
    private static final Set<OrderStatus> ALLOWED_TARGET_STATUSES =
            EnumSet.of(OrderStatus.CONFIRMED, OrderStatus.SHIPPED, OrderStatus.DELIVERED);

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public PageResponse<AdminOrderSummaryDto> listOrders(OrderStatus status, Pageable pageable) {
        Page<Order> page = status == null
                ? orderRepository.findAllByOrderByCreatedDateDesc(pageable)
                : orderRepository.findByStatusOrderByCreatedDateDesc(status, pageable);
        return PageResponse.from(page, toSummaries(page.getContent()));
    }

    public AdminOrderDetailDto getOrder(String orderNumber) {
        Order order = findOrder(orderNumber);
        List<OrderItem> items = orderItemRepository.findByOrderIdOrderByCreatedDateAsc(order.getId());
        return toDetailDto(order, items);
    }

    @Transactional
    public AdminOrderDetailDto updateStatus(String orderNumber, OrderStatus targetStatus) {
        Order order = findOrder(orderNumber);
        validateTransition(order.getStatus(), targetStatus);
        order.setStatus(targetStatus);

        notificationService.sendOrderStatusUpdate(order);

        List<OrderItem> items = orderItemRepository.findByOrderIdOrderByCreatedDateAsc(order.getId());
        return toDetailDto(order, items);
    }

    /**
     * Shared with {@code AdminDashboardService} so the "recent orders"
     * widget uses the exact same customer-resolution/mapping as the list
     * endpoint.
     */
    public List<AdminOrderSummaryDto> toSummaries(List<Order> orders) {
        if (orders.isEmpty()) {
            return List.of();
        }
        // Sprint 6: a POS walk-in sale has no userId, so it must be filtered
        // out before this lookup - findAllById does not accept nulls.
        List<UUID> userIds = orders.stream().map(Order::getUserId).filter(Objects::nonNull).distinct().toList();
        Map<UUID, User> usersById = userIds.isEmpty() ? Map.of()
                : userRepository.findAllById(userIds).stream()
                        .collect(Collectors.toMap(User::getId, user -> user));

        return orders.stream()
                .map(order -> {
                    User user = order.getUserId() != null ? usersById.get(order.getUserId()) : null;
                    return new AdminOrderSummaryDto(
                            order.getOrderNumber(),
                            order.getStatus(),
                            order.getChannel(),
                            order.getTotalAmount(),
                            order.getItemCount(),
                            order.getCreatedDate(),
                            user != null ? user.getEmail() : null,
                            user != null ? user.getFullName() : order.getWalkInCustomerName());
                })
                .toList();
    }

    private Order findOrder(String orderNumber) {
        return orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> ResourceNotFoundException.of("Order", "orderNumber", orderNumber));
    }

    /**
     * Simple forward-only check (not a full state machine, per scope): the
     * target must be one of the admin-reachable statuses, the order must not
     * already be in a terminal CANCELLED state, and the target must be
     * "further along" than the current status.
     */
    private void validateTransition(OrderStatus current, OrderStatus target) {
        if (!ALLOWED_TARGET_STATUSES.contains(target)) {
            throw new ApiException(
                    "Status can only be updated to CONFIRMED, SHIPPED or DELIVERED", HttpStatus.BAD_REQUEST);
        }
        if (current == OrderStatus.CANCELLED) {
            throw new ApiException("Cannot change the status of a cancelled order", HttpStatus.CONFLICT);
        }
        if (target.ordinal() <= current.ordinal()) {
            throw new ApiException(
                    "Cannot transition order from %s to %s".formatted(current, target), HttpStatus.CONFLICT);
        }
    }

    private AdminOrderDetailDto toDetailDto(Order order, List<OrderItem> items) {
        // Sprint 6: order.getUserId() is null for a POS walk-in sale -
        // findById(null) throws, so it must be guarded here.
        User user = order.getUserId() != null ? userRepository.findById(order.getUserId()).orElse(null) : null;

        ShippingAddressDto shippingAddress = new ShippingAddressDto(
                order.getShippingFullName(),
                order.getShippingPhoneNumber(),
                order.getShippingAddressLine1(),
                order.getShippingAddressLine2(),
                order.getShippingCity(),
                order.getShippingState(),
                order.getShippingPostalCode(),
                order.getShippingCountry());

        List<OrderItemDto> itemDtos = items.stream()
                .map(item -> new OrderItemDto(
                        item.getProductId(),
                        item.getOrnamentId(),
                        item.getProductName(),
                        item.getProductImageUrl(),
                        item.getUnitPrice(),
                        item.getQuantity(),
                        item.getLineTotal()))
                .toList();

        return new AdminOrderDetailDto(
                order.getOrderNumber(),
                order.getStatus(),
                order.getChannel(),
                order.getPaymentMethod(),
                order.getPaymentStatus(),
                order.getPaymentReference(),
                order.getSubtotal(),
                order.getDiscountAmount(),
                order.getGstAmount(),
                order.getShippingFee(),
                order.getTotalAmount(),
                order.getWalkInCustomerName(),
                shippingAddress,
                itemDtos,
                order.getCreatedDate(),
                order.getUpdatedDate(),
                order.getUserId(),
                user != null ? user.getEmail() : null,
                user != null ? user.getFullName() : null);
    }
}
