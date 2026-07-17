package com.luxora.jewellery.wishlist.service;

import com.luxora.jewellery.common.exception.ResourceNotFoundException;
import com.luxora.jewellery.product.dto.ProductSummaryDto;
import com.luxora.jewellery.product.repository.ProductRepository;
import com.luxora.jewellery.product.service.ProductService;
import com.luxora.jewellery.user.entity.User;
import com.luxora.jewellery.user.repository.UserRepository;
import com.luxora.jewellery.wishlist.entity.WishlistItem;
import com.luxora.jewellery.wishlist.repository.WishlistItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class WishlistService {

    private final WishlistItemRepository wishlistItemRepository;
    private final ProductRepository productRepository;
    private final ProductService productService;
    private final UserRepository userRepository;

    public List<ProductSummaryDto> getWishlist(String email) {
        UUID userId = resolveUserId(email);
        List<WishlistItem> items = wishlistItemRepository.findByUserIdOrderByCreatedDateDesc(userId);
        if (items.isEmpty()) {
            return List.of();
        }

        List<UUID> productIds = items.stream().map(WishlistItem::getProductId).toList();
        Map<UUID, ProductSummaryDto> summaries = productService.getProductSummaryMapByIds(productIds);

        // preserve wishlist order (most-recently-added first); silently drop
        // products that are no longer active/available
        return items.stream()
                .map(item -> summaries.get(item.getProductId()))
                .filter(dto -> dto != null)
                .toList();
    }

    @Transactional
    public void addItem(String email, UUID productId) {
        UUID userId = resolveUserId(email);
        if (wishlistItemRepository.findByUserIdAndProductId(userId, productId).isPresent()) {
            return; // idempotent - already wishlisted
        }
        if (!productRepository.existsByIdAndIsActiveTrue(productId)) {
            throw ResourceNotFoundException.of("Product", "id", productId);
        }
        wishlistItemRepository.save(WishlistItem.builder().userId(userId).productId(productId).build());
    }

    @Transactional
    public void removeItem(String email, UUID productId) {
        UUID userId = resolveUserId(email);
        wishlistItemRepository.findByUserIdAndProductId(userId, productId)
                .ifPresent(wishlistItemRepository::delete);
    }

    private UUID resolveUserId(String email) {
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> ResourceNotFoundException.of("User", "email", email));
        return user.getId();
    }
}
