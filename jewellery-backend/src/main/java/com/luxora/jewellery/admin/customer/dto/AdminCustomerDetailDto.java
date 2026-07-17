package com.luxora.jewellery.admin.customer.dto;

import com.luxora.jewellery.common.dto.PageResponse;
import com.luxora.jewellery.order.dto.OrderSummaryDto;

import java.time.Instant;
import java.util.UUID;

public record AdminCustomerDetailDto(
        UUID id,
        String email,
        String fullName,
        String phoneNumber,
        boolean isActive,
        Instant createdDate,
        PageResponse<OrderSummaryDto> orders
) {
}
