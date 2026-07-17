package com.luxora.jewellery.wishlist.repository;

import com.luxora.jewellery.wishlist.entity.WishlistItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface WishlistItemRepository extends JpaRepository<WishlistItem, UUID> {

    List<WishlistItem> findByUserIdOrderByCreatedDateDesc(UUID userId);

    Optional<WishlistItem> findByUserIdAndProductId(UUID userId, UUID productId);
}
