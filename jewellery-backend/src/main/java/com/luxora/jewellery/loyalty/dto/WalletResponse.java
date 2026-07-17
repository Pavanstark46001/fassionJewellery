package com.luxora.jewellery.loyalty.dto;

import com.luxora.jewellery.common.dto.PageResponse;

import java.math.BigDecimal;

public record WalletResponse(
        BigDecimal balance,
        PageResponse<WalletTransactionDto> transactions
) {
}
