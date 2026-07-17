package com.luxora.jewellery.order.service;

import com.luxora.jewellery.address.entity.Address;
import com.luxora.jewellery.address.repository.AddressRepository;
import com.luxora.jewellery.cart.dto.CartItemDto;
import com.luxora.jewellery.cart.dto.CartResponse;
import com.luxora.jewellery.cart.service.CartService;
import com.luxora.jewellery.common.dto.PageResponse;
import com.luxora.jewellery.common.exception.ApiException;
import com.luxora.jewellery.common.exception.ResourceNotFoundException;
import com.luxora.jewellery.order.dto.OrderDetailDto;
import com.luxora.jewellery.order.dto.OrderItemDto;
import com.luxora.jewellery.order.dto.OrderSummaryDto;
import com.luxora.jewellery.order.dto.PlaceOrderRequest;
import com.luxora.jewellery.order.dto.ShippingAddressDto;
import com.luxora.jewellery.inventory.service.InventoryService;
import com.luxora.jewellery.loyalty.service.WalletService;
import com.luxora.jewellery.notification.service.NotificationService;
import com.luxora.jewellery.order.entity.Order;
import com.luxora.jewellery.order.entity.OrderItem;
import com.luxora.jewellery.order.entity.OrderStatus;
import com.luxora.jewellery.order.entity.PaymentMethod;
import com.luxora.jewellery.order.entity.PaymentStatus;
import com.luxora.jewellery.order.repository.OrderItemRepository;
import com.luxora.jewellery.order.repository.OrderRepository;
import com.luxora.jewellery.payment.PaymentGateway;
import com.luxora.jewellery.payment.PaymentResult;
import com.luxora.jewellery.product.dto.ProductSummaryDto;
import com.luxora.jewellery.product.entity.StockStatus;
import com.luxora.jewellery.user.entity.User;
import com.luxora.jewellery.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OrderService {

    /** Flat shipping fee applied to every order this sprint - no free-shipping
     * threshold / weight-based calculation yet, that's a later refinement. */
    private static final BigDecimal FLAT_SHIPPING_FEE = new BigDecimal("99.00");
    private static final String ORDER_NUMBER_PREFIX = "SSFJ-";

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final AddressRepository addressRepository;
    private final UserRepository userRepository;
    private final CartService cartService;
    private final PaymentGateway paymentGateway;
    private final NotificationService notificationService;
    private final InventoryService inventoryService;
    private final WalletService walletService;

    @Transactional
    public OrderDetailDto placeOrder(String email, PlaceOrderRequest request) {
        User user = resolveUser(email);
        Address address = addressRepository.findByIdAndUserId(request.addressId(), user.getId())
                .orElseThrow(() -> ResourceNotFoundException.of("Address", "id", request.addressId()));

        CartResponse cart = cartService.getCart(email);
        if (cart.items().isEmpty()) {
            throw new ApiException("Your cart is empty - add items before placing an order", HttpStatus.BAD_REQUEST);
        }

        for (CartItemDto item : cart.items()) {
            ProductSummaryDto product = item.product();
            if (product.stockStatus() == StockStatus.OUT_OF_STOCK) {
                throw new ApiException(
                        "\"%s\" is currently out of stock and cannot be ordered".formatted(product.name()),
                        HttpStatus.BAD_REQUEST);
            }
        }

        BigDecimal subtotal = cart.summary().subtotal();
        BigDecimal shippingFee = FLAT_SHIPPING_FEE;
        BigDecimal totalAmount = subtotal.add(shippingFee);
        int itemCount = cart.summary().itemCount();

        String orderNumber = generateOrderNumber();

        // Sprint 8: optional wallet redemption. Capped at min(requested,
        // wallet balance, order total so far) so it can never overdraw the
        // wallet or push totalAmount below zero - see WalletService.redeem.
        BigDecimal walletRedeemed = walletService.redeem(
                user.getId(), request.useWalletAmount(), totalAmount, orderNumber);
        totalAmount = totalAmount.subtract(walletRedeemed);

        Order order = Order.builder()
                .userId(user.getId())
                .orderNumber(orderNumber)
                .status(OrderStatus.PLACED)
                .paymentMethod(request.paymentMethod())
                .paymentStatus(PaymentStatus.PENDING)
                .subtotal(subtotal)
                .shippingFee(shippingFee)
                .totalAmount(totalAmount)
                .itemCount(itemCount)
                .shippingFullName(address.getFullName())
                .shippingPhoneNumber(address.getPhoneNumber())
                .shippingAddressLine1(address.getAddressLine1())
                .shippingAddressLine2(address.getAddressLine2())
                .shippingCity(address.getCity())
                .shippingState(address.getState())
                .shippingPostalCode(address.getPostalCode())
                .shippingCountry(address.getCountry())
                .build();
        order = orderRepository.save(order);
        UUID orderId = order.getId();

        List<OrderItem> orderItems = cart.items().stream()
                .map(item -> toOrderItem(orderId, item))
                .toList();
        orderItemRepository.saveAll(orderItems);

        // Sprint 8: real stock deduction, one line item at a time. Throws
        // (rolling back this whole transaction, order included) if any item
        // no longer has enough quantity on hand.
        for (CartItemDto item : cart.items()) {
            inventoryService.deductStock(item.product().id(), item.quantity(), order.getOrderNumber());
        }

        cartService.clearCart(email);

        // Sprint 8: reward accrual (2% of the final total, COD and ONLINE
        // alike) and the one-time referral bonus, if this turns out to be
        // this user's first order ever.
        walletService.awardPurchaseReward(user.getId(), order.getTotalAmount(), order.getOrderNumber());
        walletService.awardReferralBonusIfFirstOrder(user.getId(), order.getOrderNumber());

        notificationService.sendOrderConfirmation(order);

        return toDetailDto(order, orderItems);
    }

    public PageResponse<OrderSummaryDto> listOrders(String email, Pageable pageable) {
        UUID userId = resolveUser(email).getId();
        var page = orderRepository.findByUserIdOrderByCreatedDateDesc(userId, pageable);
        List<OrderSummaryDto> summaries = page.getContent().stream().map(this::toSummaryDto).toList();
        return PageResponse.from(page, summaries);
    }

    public OrderDetailDto getOrder(String email, String orderNumber) {
        UUID userId = resolveUser(email).getId();
        Order order = findOwnedOrder(orderNumber, userId);
        List<OrderItem> items = orderItemRepository.findByOrderIdOrderByCreatedDateAsc(order.getId());
        return toDetailDto(order, items);
    }

    @Transactional
    public OrderDetailDto cancelOrder(String email, String orderNumber) {
        UUID userId = resolveUser(email).getId();
        Order order = findOwnedOrder(orderNumber, userId);

        if (order.getStatus() != OrderStatus.PLACED) {
            throw new ApiException(
                    "Order can only be cancelled while it is still in PLACED status (current status: %s)"
                            .formatted(order.getStatus()),
                    HttpStatus.CONFLICT);
        }
        order.setStatus(OrderStatus.CANCELLED);

        notificationService.sendOrderCancellation(order);

        List<OrderItem> items = orderItemRepository.findByOrderIdOrderByCreatedDateAsc(order.getId());
        return toDetailDto(order, items);
    }

    /**
     * Charges an ONLINE order via the (mock) {@link PaymentGateway}. Only
     * valid for orders paid by {@code ONLINE} that are still {@code
     * PENDING} - COD orders never go through this endpoint, and an order
     * can't be paid twice.
     */
    @Transactional
    public OrderDetailDto payOrder(String email, String orderNumber) {
        UUID userId = resolveUser(email).getId();
        Order order = findOwnedOrder(orderNumber, userId);

        if (order.getPaymentMethod() != PaymentMethod.ONLINE) {
            throw new ApiException(
                    "Order %s is not an online-payment order".formatted(orderNumber),
                    HttpStatus.BAD_REQUEST);
        }
        if (order.getPaymentStatus() != PaymentStatus.PENDING) {
            throw new ApiException(
                    "Order %s payment is already %s".formatted(orderNumber, order.getPaymentStatus()),
                    HttpStatus.CONFLICT);
        }

        PaymentResult result = paymentGateway.charge(order);
        // The mock gateway always succeeds (see MockPaymentGateway); a real
        // integration would branch on result.success() here and leave the
        // order PENDING (or record a FAILED state) on decline.
        order.setPaymentStatus(PaymentStatus.PAID);
        order.setPaymentReference(result.transactionReference());
        if (order.getStatus() == OrderStatus.PLACED) {
            order.setStatus(OrderStatus.CONFIRMED);
        }

        notificationService.sendPaymentConfirmation(order);

        List<OrderItem> items = orderItemRepository.findByOrderIdOrderByCreatedDateAsc(order.getId());
        return toDetailDto(order, items);
    }

    /**
     * Loads the order entity + its items for invoice generation, scoped to
     * the requesting user - used by {@link InvoiceService}.
     */
    OrderWithItems loadOwnedOrderWithItems(String email, String orderNumber) {
        UUID userId = resolveUser(email).getId();
        Order order = findOwnedOrder(orderNumber, userId);
        List<OrderItem> items = orderItemRepository.findByOrderIdOrderByCreatedDateAsc(order.getId());
        return new OrderWithItems(order, items);
    }

    record OrderWithItems(Order order, List<OrderItem> items) {
    }

    private Order findOwnedOrder(String orderNumber, UUID userId) {
        return orderRepository.findByOrderNumberAndUserId(orderNumber, userId)
                .orElseThrow(() -> ResourceNotFoundException.of("Order", "orderNumber", orderNumber));
    }

    private String generateOrderNumber() {
        long seq = orderRepository.nextOrderNumberSequence();
        return ORDER_NUMBER_PREFIX + "%06d".formatted(seq);
    }

    private OrderItem toOrderItem(UUID orderId, CartItemDto item) {
        ProductSummaryDto product = item.product();
        BigDecimal unitPrice = product.discountedPrice() != null ? product.discountedPrice() : product.basePrice();
        return OrderItem.builder()
                .orderId(orderId)
                .productId(product.id())
                .ornamentId(product.ornamentId())
                .productName(product.name())
                .productImageUrl(product.primaryImageUrl())
                .unitPrice(unitPrice)
                .quantity(item.quantity())
                .lineTotal(item.lineTotal())
                .build();
    }

    private OrderSummaryDto toSummaryDto(Order order) {
        return new OrderSummaryDto(
                order.getOrderNumber(),
                order.getStatus(),
                order.getTotalAmount(),
                order.getItemCount(),
                order.getCreatedDate());
    }

    private OrderDetailDto toDetailDto(Order order, List<OrderItem> items) {
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
                .map(oi -> new OrderItemDto(
                        oi.getProductId(),
                        oi.getOrnamentId(),
                        oi.getProductName(),
                        oi.getProductImageUrl(),
                        oi.getUnitPrice(),
                        oi.getQuantity(),
                        oi.getLineTotal()))
                .toList();

        return new OrderDetailDto(
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
                order.getUpdatedDate());
    }

    private User resolveUser(String email) {
        return userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> ResourceNotFoundException.of("User", "email", email));
    }
}
