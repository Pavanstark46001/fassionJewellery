package com.luxora.jewellery.admin.order.dto;

import com.luxora.jewellery.order.entity.OrderStatus;
import jakarta.validation.constraints.NotNull;

public record AdminOrderStatusUpdateRequest(
        @NotNull(message = "status is required")
        OrderStatus status
) {
}
