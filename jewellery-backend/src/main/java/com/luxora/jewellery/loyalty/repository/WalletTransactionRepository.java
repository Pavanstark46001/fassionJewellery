package com.luxora.jewellery.loyalty.repository;

import com.luxora.jewellery.loyalty.entity.TransactionType;
import com.luxora.jewellery.loyalty.entity.WalletTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface WalletTransactionRepository extends JpaRepository<WalletTransaction, UUID> {

    Page<WalletTransaction> findByUserIdOrderByCreatedDateDesc(UUID userId, Pageable pageable);

    /** Idempotency guard for the referral bonus: a referred user only ever
     * gets one {@code REFERRAL_BONUS} row, for their own first order. */
    boolean existsByUserIdAndTransactionType(UUID userId, TransactionType transactionType);
}
