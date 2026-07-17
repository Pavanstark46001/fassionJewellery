package com.luxora.jewellery.admin.customer.service;

import com.luxora.jewellery.admin.customer.dto.AdminCustomerDetailDto;
import com.luxora.jewellery.admin.customer.dto.AdminCustomerSummaryDto;
import com.luxora.jewellery.common.dto.PageResponse;
import com.luxora.jewellery.common.exception.ResourceNotFoundException;
import com.luxora.jewellery.order.dto.OrderSummaryDto;
import com.luxora.jewellery.order.entity.Order;
import com.luxora.jewellery.order.repository.OrderRepository;
import com.luxora.jewellery.user.entity.User;
import com.luxora.jewellery.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Read-only (Sprint 5 scope - no edit/permission management yet) admin view
 * over registered customers, reusing {@code User}/{@code Order} rather than
 * a bespoke reporting model.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminCustomerService {

    private final UserRepository userRepository;
    private final OrderRepository orderRepository;

    public PageResponse<AdminCustomerSummaryDto> listCustomers(String q, Pageable pageable) {
        Page<User> page = userRepository.search(q, pageable);

        List<UUID> userIds = page.getContent().stream().map(User::getId).toList();
        Map<UUID, Long> orderCountsByUser = userIds.isEmpty() ? Map.of()
                : orderRepository.countGroupByUserIds(userIds).stream()
                        .collect(Collectors.toMap(OrderRepository.UserOrderCount::getUserId,
                                OrderRepository.UserOrderCount::getCount));

        List<AdminCustomerSummaryDto> content = page.getContent().stream()
                .map(user -> new AdminCustomerSummaryDto(
                        user.getId(),
                        user.getEmail(),
                        user.getFullName(),
                        user.getPhoneNumber(),
                        user.isActive(),
                        user.getCreatedDate(),
                        orderCountsByUser.getOrDefault(user.getId(), 0L)))
                .toList();

        return PageResponse.from(page, content);
    }

    public AdminCustomerDetailDto getCustomer(UUID userId, Pageable pageable) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ResourceNotFoundException.of("User", "id", userId));

        Page<Order> orders = orderRepository.findByUserIdOrderByCreatedDateDesc(userId, pageable);
        List<OrderSummaryDto> orderDtos = orders.getContent().stream()
                .map(order -> new OrderSummaryDto(
                        order.getOrderNumber(), order.getStatus(), order.getTotalAmount(),
                        order.getItemCount(), order.getCreatedDate()))
                .toList();

        return new AdminCustomerDetailDto(
                user.getId(), user.getEmail(), user.getFullName(), user.getPhoneNumber(),
                user.isActive(), user.getCreatedDate(), PageResponse.from(orders, orderDtos));
    }
}
