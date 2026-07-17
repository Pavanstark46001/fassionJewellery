package com.luxora.jewellery.order.entity;

import com.luxora.jewellery.common.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * A placed order. {@code userId} is a plain UUID column (same rationale as
 * {@code CartItem}/{@code Address} - access is always by id equality, never
 * graph navigation). The shipping address is snapshotted onto the order as
 * plain columns (not a FK to {@code Address}) since an order's shipping
 * details must not silently change if the customer later edits/deletes that
 * saved address. Line items live in {@code OrderItem}, looked up by
 * {@code orderId}, following the same no-JPA-association convention.
 *
 * <p>Sprint 6: {@code userId} became nullable to support in-store POS sales
 * to walk-in customers with no account - {@code walkInCustomerName}/{@code
 * walkInCustomerPhone} carry the customer's details in that case (both null
 * for a normal WEB order, and also null for a POS sale that staff linked to
 * a real {@code userId} after looking the customer up). A POS sale still
 * populates the shipping-address columns (with in-store placeholder values)
 * rather than making them nullable too, since there's no in-person-sale
 * equivalent field set yet and that's a bigger schema change than this
 * sprint needs - see {@code PosService} for how those columns are filled.
 */
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "orders")
@SQLDelete(sql = "UPDATE orders SET is_deleted = true, deleted_date = now() WHERE id = ? AND version = ?")
@SQLRestriction("is_deleted = false")
public class Order extends BaseEntity {

    @Column(name = "user_id")
    private UUID userId;

    /** Sprint 6: which sales channel produced this order. Defaults to
     * {@code WEB} so existing order-creation code (Sprint 3's {@code
     * OrderService#placeOrder}) doesn't need to change to keep working. */
    @Enumerated(EnumType.STRING)
    @Column(name = "channel", nullable = false, length = 10)
    @Builder.Default
    private OrderChannel channel = OrderChannel.WEB;

    /** Populated only for a POS sale with no linked {@code userId}. */
    @Column(name = "walk_in_customer_name", length = 255)
    private String walkInCustomerName;

    /** Populated only for a POS sale with no linked {@code userId}. */
    @Column(name = "walk_in_customer_phone", length = 20)
    private String walkInCustomerPhone;

    /** Flat manual discount applied at the register. Zero for every WEB
     * order (there's no discount-code system yet). */
    @Column(name = "discount_amount", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal discountAmount = BigDecimal.ZERO;

    /** GST computed at order time, broken out separately from {@code
     * totalAmount} for tax-invoice compliance. Zero for every WEB order
     * (Sprints 1-5 never computed tax) - only the new POS sale flow sets
     * this. */
    @Column(name = "gst_amount", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal gstAmount = BigDecimal.ZERO;

    @Column(name = "order_number", nullable = false, unique = true, length = 20)
    private String orderNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private OrderStatus status;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", nullable = false, length = 20)
    private PaymentMethod paymentMethod;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false, length = 20)
    private PaymentStatus paymentStatus;

    /** Gateway-assigned reference id, set once the order's payment succeeds
     * (mock gateway for now - see {@code payment} package). Null until then. */
    @Column(name = "payment_reference", length = 100)
    private String paymentReference;

    @Column(name = "subtotal", nullable = false, precision = 12, scale = 2)
    private BigDecimal subtotal;

    @Column(name = "shipping_fee", nullable = false, precision = 12, scale = 2)
    private BigDecimal shippingFee;

    @Column(name = "total_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalAmount;

    /** Sum of line-item quantities at order time, denormalized so the
     * paginated order list can render an item count without an extra
     * per-order query. */
    @Column(name = "item_count", nullable = false)
    private int itemCount;

    @Column(name = "shipping_full_name", nullable = false, length = 255)
    private String shippingFullName;

    @Column(name = "shipping_phone_number", nullable = false, length = 20)
    private String shippingPhoneNumber;

    @Column(name = "shipping_address_line1", nullable = false, length = 255)
    private String shippingAddressLine1;

    @Column(name = "shipping_address_line2", length = 255)
    private String shippingAddressLine2;

    @Column(name = "shipping_city", nullable = false, length = 100)
    private String shippingCity;

    @Column(name = "shipping_state", nullable = false, length = 100)
    private String shippingState;

    @Column(name = "shipping_postal_code", nullable = false, length = 20)
    private String shippingPostalCode;

    @Column(name = "shipping_country", nullable = false, length = 100)
    private String shippingCountry;
}
