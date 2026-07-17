package com.luxora.jewellery.loyalty.entity;

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

import java.math.BigDecimal;
import java.util.UUID;

/**
 * An append-only ledger row for a wallet balance change. Keyed directly by
 * {@code userId} rather than {@code walletId} - same no-JPA-association,
 * query-by-id-equality convention as {@code CartItem}/{@code Address}, and
 * every wallet is 1:1 with a user anyway so nothing is lost by not going
 * through the {@code Wallet} row's own id.
 */
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "wallet_transactions")
@SQLDelete(sql = "UPDATE wallet_transactions SET is_deleted = true, deleted_date = now() WHERE id = ? AND version = ?")
@SQLRestriction("is_deleted = false")
public class WalletTransaction extends BaseEntity {

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    /** Signed: positive credit, negative debit. */
    @Column(name = "amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(name = "transaction_type", nullable = false, length = 20)
    private TransactionType transactionType;

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "reference_order_number", length = 20)
    private String referenceOrderNumber;
}
