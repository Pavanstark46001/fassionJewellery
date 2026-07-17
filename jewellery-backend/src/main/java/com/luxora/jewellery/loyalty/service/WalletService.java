package com.luxora.jewellery.loyalty.service;

import com.luxora.jewellery.common.dto.PageResponse;
import com.luxora.jewellery.common.exception.ResourceNotFoundException;
import com.luxora.jewellery.loyalty.dto.WalletResponse;
import com.luxora.jewellery.loyalty.dto.WalletTransactionDto;
import com.luxora.jewellery.loyalty.entity.TransactionType;
import com.luxora.jewellery.loyalty.entity.Wallet;
import com.luxora.jewellery.loyalty.entity.WalletTransaction;
import com.luxora.jewellery.loyalty.repository.WalletRepository;
import com.luxora.jewellery.loyalty.repository.WalletTransactionRepository;
import com.luxora.jewellery.order.repository.OrderRepository;
import com.luxora.jewellery.user.entity.User;
import com.luxora.jewellery.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.UUID;

/**
 * Sprint 8: wallet / reward-points / referral-bonus engine. A wallet balance
 * is tracked as a plain rupee amount (not abstract points); every balance
 * change is also written to the append-only {@code WalletTransaction}
 * ledger so {@code GET /api/v1/wallet} can show full history, not just the
 * running total.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class WalletService {

    /** Flat reward rate credited on every WEB/POS sale linked to a real
     * account - 2% of the final order total, regardless of payment method. */
    private static final BigDecimal PURCHASE_REWARD_RATE = new BigDecimal("0.02");

    /** Flat one-time bonus paid to BOTH the referrer and the referred user
     * once the referred user places their first order (any channel). */
    private static final BigDecimal REFERRAL_BONUS_AMOUNT = new BigDecimal("100.00");

    private final WalletRepository walletRepository;
    private final WalletTransactionRepository walletTransactionRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;

    public WalletResponse getWallet(String email, Pageable pageable) {
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> ResourceNotFoundException.of("User", "email", email));
        Wallet wallet = getOrCreateWallet(user.getId());
        Page<WalletTransaction> page =
                walletTransactionRepository.findByUserIdOrderByCreatedDateDesc(user.getId(), pageable);
        return new WalletResponse(wallet.getBalance(),
                PageResponse.from(page, page.getContent().stream().map(this::toDto).toList()));
    }

    /**
     * Fetches the user's wallet, lazily creating a zero-balance one if
     * somehow missing (every user gets one at registration / via the V9
     * backfill migration, but this keeps the credit/debit paths safe
     * regardless).
     */
    @Transactional
    public Wallet getOrCreateWallet(UUID userId) {
        return walletRepository.findByUserId(userId)
                .orElseGet(() -> walletRepository.save(Wallet.builder().userId(userId).balance(BigDecimal.ZERO).build()));
    }

    /**
     * Credits 2% of the order's final total as a {@code PURCHASE_REWARD}.
     * No-op for a {@code null} userId - an anonymous POS walk-in sale has no
     * wallet to credit.
     */
    @Transactional
    public void awardPurchaseReward(UUID userId, BigDecimal orderTotal, String orderNumber) {
        if (userId == null || orderTotal == null || orderTotal.signum() <= 0) {
            return;
        }
        BigDecimal reward = orderTotal.multiply(PURCHASE_REWARD_RATE).setScale(2, RoundingMode.HALF_UP);
        if (reward.signum() <= 0) {
            return;
        }
        credit(userId, reward, TransactionType.PURCHASE_REWARD,
                "2% purchase reward for order " + orderNumber, orderNumber);
    }

    /**
     * Awards the flat referral bonus to both the new user and their
     * referrer, but only the very first time the new user's order count
     * hits 1 (called right after the current order/sale was saved, so a
     * count of exactly 1 means this is that first order). Idempotent: also
     * short-circuits if the new user already has a {@code REFERRAL_BONUS}
     * row, which the order-count check alone already guarantees but is
     * cheap extra insurance against a double-call.
     */
    @Transactional
    public void awardReferralBonusIfFirstOrder(UUID userId, String orderNumber) {
        if (userId == null) {
            return;
        }
        User user = userRepository.findById(userId).orElse(null);
        if (user == null || user.getReferredByUserId() == null) {
            return;
        }
        if (walletTransactionRepository.existsByUserIdAndTransactionType(userId, TransactionType.REFERRAL_BONUS)) {
            return;
        }
        if (orderRepository.countByUserId(userId) != 1) {
            return;
        }

        credit(userId, REFERRAL_BONUS_AMOUNT, TransactionType.REFERRAL_BONUS,
                "Referral bonus for signing up with a referral code", orderNumber);
        credit(user.getReferredByUserId(), REFERRAL_BONUS_AMOUNT, TransactionType.REFERRAL_BONUS,
                "Referral bonus - a user you referred placed their first order", orderNumber);
    }

    /**
     * Redeems up to {@code requestedAmount} from the user's wallet against
     * an order, capped at {@code min(requestedAmount, walletBalance,
     * maxRedeemable)} so redemption can never make the order total negative
     * or overdraw the wallet. Returns the amount actually redeemed (zero if
     * nothing was redeemable).
     */
    @Transactional
    public BigDecimal redeem(UUID userId, BigDecimal requestedAmount, BigDecimal maxRedeemable, String orderNumber) {
        if (userId == null || requestedAmount == null || requestedAmount.signum() <= 0
                || maxRedeemable == null || maxRedeemable.signum() <= 0) {
            return BigDecimal.ZERO;
        }
        Wallet wallet = getOrCreateWallet(userId);
        BigDecimal usable = requestedAmount.min(wallet.getBalance()).min(maxRedeemable);
        if (usable.signum() <= 0) {
            return BigDecimal.ZERO;
        }

        wallet.setBalance(wallet.getBalance().subtract(usable));
        walletRepository.save(wallet);
        walletTransactionRepository.save(WalletTransaction.builder()
                .userId(userId)
                .amount(usable.negate())
                .transactionType(TransactionType.REDEMPTION)
                .description("Wallet amount redeemed against order " + orderNumber)
                .referenceOrderNumber(orderNumber)
                .build());
        return usable;
    }

    private void credit(UUID userId, BigDecimal amount, TransactionType type, String description, String orderNumber) {
        Wallet wallet = getOrCreateWallet(userId);
        wallet.setBalance(wallet.getBalance().add(amount));
        walletRepository.save(wallet);
        walletTransactionRepository.save(WalletTransaction.builder()
                .userId(userId)
                .amount(amount)
                .transactionType(type)
                .description(description)
                .referenceOrderNumber(orderNumber)
                .build());
    }

    private WalletTransactionDto toDto(WalletTransaction transaction) {
        return new WalletTransactionDto(
                transaction.getId(),
                transaction.getAmount(),
                transaction.getTransactionType(),
                transaction.getDescription(),
                transaction.getReferenceOrderNumber(),
                transaction.getCreatedDate());
    }
}
