package com.luxora.jewellery.review.repository;

import com.luxora.jewellery.review.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;
import java.util.UUID;

public interface ReviewRepository extends JpaRepository<Review, UUID> {

    Page<Review> findByProductIdOrderByCreatedDateDesc(UUID productId, Pageable pageable);

    Optional<Review> findByIdAndProductId(UUID id, UUID productId);

    boolean existsByProductIdAndUserId(UUID productId, UUID userId);

    long countByProductId(UUID productId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.productId = :productId")
    Double findAverageRatingByProductId(UUID productId);
}
