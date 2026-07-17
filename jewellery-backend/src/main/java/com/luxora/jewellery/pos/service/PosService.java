package com.luxora.jewellery.pos.service;

import com.luxora.jewellery.auth.service.AuthService;
import com.luxora.jewellery.common.exception.ApiException;
import com.luxora.jewellery.common.exception.ResourceNotFoundException;
import com.luxora.jewellery.inventory.service.InventoryService;
import com.luxora.jewellery.loyalty.service.WalletService;
import com.luxora.jewellery.notification.service.NotificationService;
import com.luxora.jewellery.order.dto.OrderDetailDto;
import com.luxora.jewellery.order.dto.OrderItemDto;
import com.luxora.jewellery.order.dto.ShippingAddressDto;
import com.luxora.jewellery.order.entity.Order;
import com.luxora.jewellery.order.entity.OrderChannel;
import com.luxora.jewellery.order.entity.OrderItem;
import com.luxora.jewellery.order.entity.OrderStatus;
import com.luxora.jewellery.order.entity.PaymentMethod;
import com.luxora.jewellery.order.entity.PaymentStatus;
import com.luxora.jewellery.order.repository.OrderItemRepository;
import com.luxora.jewellery.order.repository.OrderRepository;
import com.luxora.jewellery.pos.dto.PosCreateCustomerRequest;
import com.luxora.jewellery.pos.dto.PosCustomerSearchDto;
import com.luxora.jewellery.pos.dto.PosProductLookupDto;
import com.luxora.jewellery.pos.dto.PosSaleItemRequest;
import com.luxora.jewellery.pos.dto.PosSaleRequest;
import com.luxora.jewellery.product.entity.Product;
import com.luxora.jewellery.product.entity.ProductImage;
import com.luxora.jewellery.product.entity.StockStatus;
import com.luxora.jewellery.product.repository.ProductImageRepository;
import com.luxora.jewellery.product.repository.ProductRepository;
import com.luxora.jewellery.product.specification.ProductSpecifications;
import com.luxora.jewellery.user.entity.User;
import com.luxora.jewellery.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Comparator;
import java.util.EnumSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * In-store billing / point-of-sale. A POS sale is a completed, already-paid
 * {@code Order} (no shipping to track, paid at the till) created through the
 * same {@code orders}/{@code order_items} tables as a WEB checkout - see
 * {@code Order}'s Sprint 6 javadoc for why. There is no camera/webcam
 * QR-scanning here: real USB/Bluetooth barcode scanners just emulate
 * keyboard input (they "type" the scanned code + Enter into whichever field
 * has focus), so the "scanner" integration is simply the {@link
 * #lookupProduct(String)} text lookup below - the existing {@code
 * Product.ornamentId} (e.g. {@code ORN-000001}) is the barcode/SKU value.
 * True camera-based scanning is a noted future enhancement, out of scope
 * this sprint.
 *
 * <p>Explicitly out of scope this sprint (needs a proper ledger design):
 * split/partial payments across multiple methods, exchanges, and returns. A
 * POS sale is always a single payment method, and is not itself reversible
 * through this API once created.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PosService {

    /** Same prefix/sequence as web checkout ({@code OrderService}) - order
     * numbers are unified across channels, not a separate POS numbering
     * scheme, since POS is just another sales channel. */
    private static final String ORDER_NUMBER_PREFIX = "SSFJ-";

    /** Flat GST rate applied to every POS sale. A real deployment would need
     * a configurable tax-rate module (different rates per category, HSN
     * codes, CGST/SGST/IGST splits, etc.) - that's out of scope this sprint,
     * so this is a reasonable constant default for the category. */
    private static final BigDecimal GST_RATE = new BigDecimal("0.03");

    private static final int NAME_SEARCH_LIMIT = 8;
    private static final int CUSTOMER_SEARCH_LIMIT = 10;
    private static final Set<PaymentMethod> ALLOWED_POS_PAYMENT_METHODS =
            EnumSet.of(PaymentMethod.CASH, PaymentMethod.CARD, PaymentMethod.ONLINE);

    // A POS sale is picked up in person, so there's nothing to ship - these
    // reuse the orders table's (NOT NULL) shipping-address columns as a
    // fixed "in-store" snapshot rather than making that whole column group
    // nullable, which is a bigger schema change than this sprint needs.
    private static final String STORE_ADDRESS_LINE1 = "In-Store Purchase - Sri Sai Fashion Jewellery Showroom";
    private static final String STORE_CITY = "Store Pickup";
    private static final String STORE_STATE = "Store Pickup";
    private static final String STORE_POSTAL_CODE = "000000";
    private static final String STORE_COUNTRY = "India";

    private final ProductRepository productRepository;
    private final ProductImageRepository productImageRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final NotificationService notificationService;
    private final InventoryService inventoryService;
    private final WalletService walletService;
    private final AuthService authService;

    private static final java.security.SecureRandom RANDOM = new java.security.SecureRandom();

    /**
     * Quick single-item lookup for the till: an exact {@code ornamentId}
     * match when {@code code} looks like one ({@code ORN-NNNNNN}), otherwise
     * a name-contains fallback search returning the top few matches. Always
     * returns a list so the caller has one shape to handle either way - a
     * scanned barcode typically resolves to exactly one row.
     */
    public List<PosProductLookupDto> lookupProduct(String code) {
        if (code == null || code.isBlank()) {
            throw new ApiException("code is required", HttpStatus.BAD_REQUEST);
        }
        String trimmed = code.trim();

        if (trimmed.toUpperCase(Locale.ROOT).matches("ORN-\\d+")) {
            return productRepository.findByOrnamentIdAndIsActiveTrue(trimmed.toUpperCase(Locale.ROOT))
                    .map(product -> List.of(toLookupDto(product, resolvePrimaryImages(List.of(product.getId())))))
                    .orElse(List.of());
        }

        Specification<Product> spec = Specification.allOf(
                ProductSpecifications.isActive(), ProductSpecifications.nameContains(trimmed));
        List<Product> matches = productRepository.findAll(spec, PageRequest.of(0, NAME_SEARCH_LIMIT)).getContent();
        Map<UUID, String> primaryImages = resolvePrimaryImages(matches.stream().map(Product::getId).toList());
        return matches.stream().map(product -> toLookupDto(product, primaryImages)).toList();
    }

    /**
     * Lightweight existing-customer lookup by phone number, for optionally
     * linking a POS sale to a real account. Not a full CRM search.
     */
    public List<PosCustomerSearchDto> searchCustomersByPhone(String phone) {
        if (phone == null || phone.isBlank()) {
            throw new ApiException("phone is required", HttpStatus.BAD_REQUEST);
        }
        Pageable pageable = PageRequest.of(0, CUSTOMER_SEARCH_LIMIT);
        return userRepository.findByPhoneNumberContaining(phone.trim(), pageable).stream()
                .map(user -> new PosCustomerSearchDto(user.getId(), user.getFullName(), user.getEmail(),
                        user.getPhoneNumber()))
                .toList();
    }

    /**
     * Staff-initiated quick customer creation, typically right after a phone
     * search came back empty. Reuses {@link AuthService#provisionCustomer}
     * so the new account gets the exact same wallet/referral-code/role setup
     * as a self-registered one - it's a real account, just created by staff
     * instead of the customer themselves. The random password and (when
     * omitted) placeholder email mean the customer can't log in with it
     * directly yet; that's fine; they'd use "forgot password" later if they
     * want online access, this endpoint's job is just to make them
     * findable by phone on their next visit.
     */
    @Transactional
    public PosCustomerSearchDto createCustomer(PosCreateCustomerRequest request) {
        String phone = request.phoneNumber().trim();
        String email = (request.email() == null || request.email().isBlank())
                ? placeholderEmailFor(phone)
                : request.email().trim();

        User user = authService.provisionCustomer(email, randomPassword(), request.fullName().trim(), phone, null);
        return new PosCustomerSearchDto(user.getId(), user.getFullName(), user.getEmail(), user.getPhoneNumber());
    }

    private String placeholderEmailFor(String phone) {
        String digitsOnly = phone.replaceAll("\\D", "");
        return (digitsOnly.isEmpty() ? "customer" : digitsOnly) + "@pos.local";
    }

    private String randomPassword() {
        byte[] bytes = new byte[24];
        RANDOM.nextBytes(bytes);
        return java.util.Base64.getEncoder().encodeToString(bytes);
    }

    @Transactional
    public OrderDetailDto createSale(PosSaleRequest request) {
        if (!ALLOWED_POS_PAYMENT_METHODS.contains(request.paymentMethod())) {
            throw new ApiException(
                    "POS sales must be paid by CASH, CARD or ONLINE (got %s)".formatted(request.paymentMethod()),
                    HttpStatus.BAD_REQUEST);
        }

        CustomerResolution customer = resolveCustomer(request);

        List<UUID> productIds = request.items().stream().map(PosSaleItemRequest::productId).distinct().toList();
        Map<UUID, Product> productsById = productRepository.findAllById(productIds).stream()
                .collect(Collectors.toMap(Product::getId, product -> product));
        Map<UUID, String> primaryImages = resolvePrimaryImages(productIds);

        List<LineItem> lineItems = request.items().stream()
                .map(itemRequest -> toLineItem(itemRequest, productsById, primaryImages))
                .toList();

        BigDecimal subtotal = lineItems.stream()
                .map(LineItem::lineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal discountAmount = request.discountAmount() != null ? request.discountAmount() : BigDecimal.ZERO;
        if (discountAmount.signum() < 0) {
            throw new ApiException("discountAmount cannot be negative", HttpStatus.BAD_REQUEST);
        }
        if (discountAmount.compareTo(subtotal) > 0) {
            throw new ApiException("discountAmount cannot exceed the sale subtotal", HttpStatus.BAD_REQUEST);
        }

        BigDecimal taxableAmount = subtotal.subtract(discountAmount);
        BigDecimal gstAmount = taxableAmount.multiply(GST_RATE).setScale(2, RoundingMode.HALF_UP);
        BigDecimal totalAmount = taxableAmount.add(gstAmount).setScale(2, RoundingMode.HALF_UP);

        int itemCount = request.items().stream().mapToInt(PosSaleItemRequest::quantity).sum();

        Order order = Order.builder()
                .userId(customer.userId())
                .orderNumber(generateOrderNumber())
                .channel(OrderChannel.POS)
                .status(OrderStatus.CONFIRMED)
                .paymentMethod(request.paymentMethod())
                .paymentStatus(PaymentStatus.PAID)
                .subtotal(subtotal)
                .discountAmount(discountAmount)
                .gstAmount(gstAmount)
                .shippingFee(BigDecimal.ZERO)
                .totalAmount(totalAmount)
                .itemCount(itemCount)
                .walkInCustomerName(customer.walkInName())
                .walkInCustomerPhone(customer.walkInPhone())
                .shippingFullName(customer.billToName())
                .shippingPhoneNumber(customer.billToPhone())
                .shippingAddressLine1(STORE_ADDRESS_LINE1)
                .shippingCity(STORE_CITY)
                .shippingState(STORE_STATE)
                .shippingPostalCode(STORE_POSTAL_CODE)
                .shippingCountry(STORE_COUNTRY)
                .build();
        order = orderRepository.save(order);
        UUID orderId = order.getId();

        List<OrderItem> orderItems = lineItems.stream().map(li -> li.toOrderItem(orderId)).toList();
        orderItemRepository.saveAll(orderItems);

        // Sprint 8: real stock deduction, one line item at a time - a POS
        // sale is created already-confirmed/paid, so this happens right at
        // creation just like the WEB checkout flow, not at some later step.
        for (LineItem lineItem : lineItems) {
            inventoryService.deductStock(lineItem.product().getId(), lineItem.quantity(), order.getOrderNumber());
        }

        // Anonymous walk-ins have nowhere to send a confirmation to, and no
        // account to credit reward points / referral bonuses to - only do
        // both when the sale is linked to a real account.
        if (order.getUserId() != null) {
            walletService.awardPurchaseReward(order.getUserId(), order.getTotalAmount(), order.getOrderNumber());
            walletService.awardReferralBonusIfFirstOrder(order.getUserId(), order.getOrderNumber());
            notificationService.sendOrderConfirmation(order);
        }

        return toDetailDto(order, orderItems);
    }

    private CustomerResolution resolveCustomer(PosSaleRequest request) {
        if (request.customerId() != null) {
            User user = userRepository.findById(request.customerId())
                    .orElseThrow(() -> ResourceNotFoundException.of("User", "id", request.customerId()));
            String billToName = user.getFullName() != null && !user.getFullName().isBlank()
                    ? user.getFullName() : user.getEmail();
            String billToPhone = user.getPhoneNumber() != null && !user.getPhoneNumber().isBlank()
                    ? user.getPhoneNumber() : "N/A";
            return new CustomerResolution(user.getId(), null, null, billToName, billToPhone);
        }

        String walkInName = request.walkInCustomerName();
        String walkInPhone = request.walkInCustomerPhone();
        String billToName = walkInName != null && !walkInName.isBlank() ? walkInName.trim() : "Walk-in Customer";
        String billToPhone = walkInPhone != null && !walkInPhone.isBlank() ? walkInPhone.trim() : "N/A";
        return new CustomerResolution(null, walkInName != null && !walkInName.isBlank() ? walkInName.trim() : null,
                walkInPhone != null && !walkInPhone.isBlank() ? walkInPhone.trim() : null, billToName, billToPhone);
    }

    private LineItem toLineItem(PosSaleItemRequest itemRequest, Map<UUID, Product> productsById,
                                 Map<UUID, String> primaryImages) {
        Product product = productsById.get(itemRequest.productId());
        if (product == null || !product.isActive()) {
            throw ResourceNotFoundException.of("Product", "id", itemRequest.productId());
        }
        if (product.getStockStatus() == StockStatus.OUT_OF_STOCK) {
            throw new ApiException(
                    "\"%s\" is currently out of stock and cannot be sold".formatted(product.getName()),
                    HttpStatus.BAD_REQUEST);
        }

        BigDecimal unitPrice = product.getDiscountedPrice() != null ? product.getDiscountedPrice()
                : product.getBasePrice();
        BigDecimal lineTotal = unitPrice.multiply(BigDecimal.valueOf(itemRequest.quantity()))
                .setScale(2, RoundingMode.HALF_UP);

        return new LineItem(product, itemRequest.quantity(), unitPrice, lineTotal, primaryImages.get(product.getId()));
    }

    private PosProductLookupDto toLookupDto(Product product, Map<UUID, String> primaryImages) {
        return new PosProductLookupDto(
                product.getId(),
                product.getOrnamentId(),
                product.getName(),
                primaryImages.get(product.getId()),
                product.getBasePrice(),
                product.getDiscountedPrice(),
                product.getMetalType(),
                product.getStockStatus(),
                product.getCategory() != null ? product.getCategory().getName() : null);
    }

    /** Same primary-image resolution rule as {@code ProductService}: the
     * image flagged primary, falling back to the lowest display order. */
    private Map<UUID, String> resolvePrimaryImages(List<UUID> productIds) {
        if (productIds.isEmpty()) {
            return Map.of();
        }
        return productImageRepository.findByProduct_IdInOrderByDisplayOrderAsc(productIds).stream()
                .collect(Collectors.groupingBy(
                        img -> img.getProduct().getId(),
                        Collectors.collectingAndThen(
                                Collectors.minBy(Comparator.comparing(ProductImage::isPrimary).reversed()
                                        .thenComparing(img -> img.getDisplayOrder() == null ? 0 : img.getDisplayOrder())),
                                opt -> opt.map(ProductImage::getImageUrl).orElse(null))));
    }

    private String generateOrderNumber() {
        long seq = orderRepository.nextOrderNumberSequence();
        return ORDER_NUMBER_PREFIX + "%06d".formatted(seq);
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

    private record CustomerResolution(UUID userId, String walkInName, String walkInPhone, String billToName,
                                       String billToPhone) {
    }

    private record LineItem(Product product, int quantity, BigDecimal unitPrice, BigDecimal lineTotal,
                             String primaryImageUrl) {
        OrderItem toOrderItem(UUID orderId) {
            return OrderItem.builder()
                    .orderId(orderId)
                    .productId(product.getId())
                    .ornamentId(product.getOrnamentId())
                    .productName(product.getName())
                    .productImageUrl(primaryImageUrl)
                    .unitPrice(unitPrice)
                    .quantity(quantity)
                    .lineTotal(lineTotal)
                    .build();
        }
    }
}
