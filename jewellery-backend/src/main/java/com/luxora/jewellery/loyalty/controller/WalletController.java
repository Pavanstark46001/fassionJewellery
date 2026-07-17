package com.luxora.jewellery.loyalty.controller;

import com.luxora.jewellery.common.dto.ApiResponse;
import com.luxora.jewellery.loyalty.dto.WalletResponse;
import com.luxora.jewellery.loyalty.service.WalletService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * The authenticated user's own wallet - balance plus paginated transaction
 * history. Always scoped to the calling principal (see {@code
 * SecurityConfig}, which requires authentication here - same private-data
 * pattern as {@code /api/v1/cart}/{@code /api/v1/orders}); there is no way
 * to look up another user's wallet through this endpoint.
 */
@Tag(name = "Wallet", description = "Authenticated user's own wallet balance and transaction history")
@RestController
@RequestMapping("/api/v1/wallet")
@RequiredArgsConstructor
public class WalletController {

    private final WalletService walletService;

    @GetMapping
    public ApiResponse<WalletResponse> getWallet(Authentication authentication, Pageable pageable) {
        return ApiResponse.ok(walletService.getWallet(authentication.getName(), pageable));
    }
}
