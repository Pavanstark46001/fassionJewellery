package com.luxora.jewellery.review.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

public record ReviewRequest(
        @Min(value = 1, message = "rating must be between 1 and 5")
        @Max(value = 5, message = "rating must be between 1 and 5")
        int rating,

        @Size(max = 150, message = "title must be at most 150 characters")
        String title,

        String comment
) {
}
