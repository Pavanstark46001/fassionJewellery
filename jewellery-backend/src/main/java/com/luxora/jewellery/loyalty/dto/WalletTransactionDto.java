package com.luxora.jewellery.loyalty.dto;

import com.luxora.jewellery.loyalty.entity.TransactionType;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record WalletTransactionDto(
        UUID id,
        BigDecimal amount,
        TransactionType transactionType,
        String description,
        String referenceOrderNumber,
        Instant createdDate
) {
}
