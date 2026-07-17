package com.luxora.jewellery.inventory.entity;

import com.luxora.jewellery.common.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import java.util.UUID;

/**
 * A single audit-trail row for a stock quantity change on a product -
 * purchase entries, damage write-offs, returns, manual transfer notes, and
 * sale deductions. {@code productId} is a plain UUID column (same
 * no-JPA-association rationale as {@code CartItem}/{@code Address}: access
 * is always by id equality, never graph navigation).
 *
 * <p>{@code performedBy} is deliberately NOT a separate column here - {@link
 * BaseEntity#getCreatedBy()} (populated by the existing Spring Data auditing
 * infrastructure from the authenticated principal) already captures exactly
 * that, so a redundant field would just drift out of sync.
 */
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "stock_movements")
@SQLDelete(sql = "UPDATE stock_movements SET is_deleted = true, deleted_date = now() WHERE id = ? AND version = ?")
@SQLRestriction("is_deleted = false")
public class StockMovement extends BaseEntity {

    @Column(name = "product_id", nullable = false)
    private UUID productId;

    @Enumerated(EnumType.STRING)
    @Column(name = "movement_type", nullable = false, length = 20)
    private MovementType movementType;

    /** Signed: positive for entries/returns, negative for sales/damage. */
    @Column(name = "quantity_change", nullable = false)
    private int quantityChange;

    @Column(name = "note", length = 500)
    private String note;

    /** Set only for {@code SALE_DEDUCTION} rows - the order/sale number that
     * triggered the deduction. Null for manual admin entries. */
    @Column(name = "reference_order_number", length = 20)
    private String referenceOrderNumber;
}
