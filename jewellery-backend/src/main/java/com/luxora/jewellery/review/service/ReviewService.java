package com.luxora.jewellery.review.service;

import com.luxora.jewellery.common.dto.PageResponse;
import com.luxora.jewellery.common.exception.ApiException;
import com.luxora.jewellery.common.exception.ResourceNotFoundException;
import com.luxora.jewellery.product.entity.Product;
import com.luxora.jewellery.product.repository.ProductRepository;
import com.luxora.jewellery.review.dto.ReviewDto;
import com.luxora.jewellery.review.dto.ReviewRequest;
import com.luxora.jewellery.review.entity.Review;
import com.luxora.jewellery.review.repository.ReviewRepository;
import com.luxora.jewellery.user.entity.User;
import com.luxora.jewellery.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public PageResponse<ReviewDto> getReviews(String productSlug, Pageable pageable) {
        Product product = findActiveProduct(productSlug);
        Page<Review> page = reviewRepository.findByProductIdOrderByCreatedDateDesc(product.getId(), pageable);

        Map<UUID, String> reviewerNames = userRepository.findAllById(
                        page.getContent().stream().map(Review::getUserId).distinct().toList()).stream()
                .collect(java.util.stream.Collectors.toMap(User::getId, User::getFullName));

        List<ReviewDto> content = page.getContent().stream()
                .map(review -> toDto(review, reviewerNames.get(review.getUserId())))
                .toList();

        return PageResponse.from(page, content);
    }

    @Transactional
    @CacheEvict(value = "products", key = "'slug:' + #productSlug")
    public ReviewDto createReview(String productSlug, String email, ReviewRequest request) {
        Product product = findActiveProduct(productSlug);
        User user = resolveUser(email);

        if (reviewRepository.existsByProductIdAndUserId(product.getId(), user.getId())) {
            throw new ApiException("You have already reviewed this product", HttpStatus.CONFLICT);
        }

        Review review = Review.builder()
                .productId(product.getId())
                .userId(user.getId())
                .rating(request.rating())
                .title(request.title())
                .comment(request.comment())
                .isVerifiedPurchase(false)
                .build();

        review = reviewRepository.save(review);
        return toDto(review, user.getFullName());
    }

    @Transactional
    @CacheEvict(value = "products", key = "'slug:' + #productSlug")
    public void deleteReview(String productSlug, UUID reviewId, String email) {
        Product product = findActiveProduct(productSlug);
        User user = resolveUser(email);

        Review review = reviewRepository.findByIdAndProductId(reviewId, product.getId())
                .orElseThrow(() -> ResourceNotFoundException.of("Review", "id", reviewId));

        if (!review.getUserId().equals(user.getId())) {
            throw new ApiException("You can only delete your own review", HttpStatus.FORBIDDEN);
        }

        reviewRepository.delete(review);
    }

    private ReviewDto toDto(Review review, String reviewerName) {
        return new ReviewDto(review.getId(), review.getUserId(), reviewerName, review.getRating(),
                review.getTitle(), review.getComment(), review.isVerifiedPurchase(), review.getCreatedDate());
    }

    private Product findActiveProduct(String slug) {
        return productRepository.findBySlugAndIsActiveTrue(slug)
                .orElseThrow(() -> ResourceNotFoundException.of("Product", "slug", slug));
    }

    private User resolveUser(String email) {
        return userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> ResourceNotFoundException.of("User", "email", email));
    }
}
