package com.luxora.jewellery.review.controller;

import com.luxora.jewellery.common.dto.ApiResponse;
import com.luxora.jewellery.common.dto.PageResponse;
import com.luxora.jewellery.review.dto.ReviewDto;
import com.luxora.jewellery.review.dto.ReviewRequest;
import com.luxora.jewellery.review.service.ReviewService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@Tag(name = "Reviews", description = "Product reviews - public reads, authenticated write/delete")
@RestController
@RequestMapping("/api/v1/products/{productSlug}/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping
    public ApiResponse<PageResponse<ReviewDto>> getReviews(@PathVariable String productSlug, Pageable pageable) {
        return ApiResponse.ok(reviewService.getReviews(productSlug, pageable));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ReviewDto>> createReview(@PathVariable String productSlug,
                                                                 Authentication authentication,
                                                                 @Valid @RequestBody ReviewRequest request) {
        ReviewDto created = reviewService.createReview(productSlug, authentication.getName(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Review submitted", created));
    }

    @DeleteMapping("/{reviewId}")
    public ApiResponse<Void> deleteReview(@PathVariable String productSlug, @PathVariable UUID reviewId,
                                           Authentication authentication) {
        reviewService.deleteReview(productSlug, reviewId, authentication.getName());
        return ApiResponse.ok("Review deleted", null);
    }
}
