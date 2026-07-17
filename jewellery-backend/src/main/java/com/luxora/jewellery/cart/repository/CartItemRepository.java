package com.luxora.jewellery.cart.repository;

import com.luxora.jewellery.cart.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CartItemRepository extends JpaRepository<CartItem, UUID> {

    List<CartItem> findByUserIdOrderByCreatedDateAsc(UUID userId);

    Optional<CartItem> findByUserIdAndProductId(UUID userId, UUID productId);

    void deleteByUserId(UUID userId);
}
