package com.luxora.jewellery.cart.service;

import com.luxora.jewellery.cart.dto.CartItemDto;
import com.luxora.jewellery.cart.dto.CartResponse;
import com.luxora.jewellery.cart.dto.CartSummaryDto;
import com.luxora.jewellery.cart.entity.CartItem;
import com.luxora.jewellery.cart.repository.CartItemRepository;
import com.luxora.jewellery.common.exception.ResourceNotFoundException;
import com.luxora.jewellery.product.dto.ProductSummaryDto;
import com.luxora.jewellery.product.repository.ProductRepository;
import com.luxora.jewellery.product.service.ProductService;
import com.luxora.jewellery.user.entity.User;
import com.luxora.jewellery.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CartService {

    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final ProductService productService;
    private final UserRepository userRepository;

    public CartResponse getCart(String email) {
        UUID userId = resolveUserId(email);
        return buildCartResponse(cartItemRepository.findByUserIdOrderByCreatedDateAsc(userId));
    }

    @Transactional
    public CartResponse addItem(String email, UUID productId, int quantity) {
        UUID userId = resolveUserId(email);
        if (!productRepository.existsByIdAndIsActiveTrue(productId)) {
            throw ResourceNotFoundException.of("Product", "id", productId);
        }

        CartItem item = cartItemRepository.findByUserIdAndProductId(userId, productId)
                .map(existing -> {
                    existing.setQuantity(existing.getQuantity() + quantity);
                    return existing;
                })
                .orElseGet(() -> CartItem.builder().userId(userId).productId(productId).quantity(quantity).build());
        cartItemRepository.save(item);

        return buildCartResponse(cartItemRepository.findByUserIdOrderByCreatedDateAsc(userId));
    }

    @Transactional
    public CartResponse updateQuantity(String email, UUID productId, int quantity) {
        UUID userId = resolveUserId(email);
        CartItem item = cartItemRepository.findByUserIdAndProductId(userId, productId)
                .orElseThrow(() -> ResourceNotFoundException.of("CartItem", "productId", productId));

        if (quantity <= 0) {
            cartItemRepository.delete(item);
        } else {
            item.setQuantity(quantity);
            cartItemRepository.save(item);
        }

        return buildCartResponse(cartItemRepository.findByUserIdOrderByCreatedDateAsc(userId));
    }

    @Transactional
    public CartResponse removeItem(String email, UUID productId) {
        UUID userId = resolveUserId(email);
        CartItem item = cartItemRepository.findByUserIdAndProductId(userId, productId)
                .orElseThrow(() -> ResourceNotFoundException.of("CartItem", "productId", productId));
        cartItemRepository.delete(item);
        return buildCartResponse(cartItemRepository.findByUserIdOrderByCreatedDateAsc(userId));
    }

    @Transactional
    public void clearCart(String email) {
        UUID userId = resolveUserId(email);
        cartItemRepository.deleteByUserId(userId);
    }

    private CartResponse buildCartResponse(List<CartItem> cartItems) {
        if (cartItems.isEmpty()) {
            return new CartResponse(List.of(), new CartSummaryDto(0, BigDecimal.ZERO));
        }

        List<UUID> productIds = cartItems.stream().map(CartItem::getProductId).toList();
        Map<UUID, ProductSummaryDto> summaries = productService.getProductSummaryMapByIds(productIds);

        List<CartItemDto> itemDtos = cartItems.stream()
                .map(ci -> summaries.get(ci.getProductId()) == null ? null : toItemDto(ci, summaries.get(ci.getProductId())))
                .filter(dto -> dto != null)
                .toList();

        int itemCount = itemDtos.stream().mapToInt(CartItemDto::quantity).sum();
        BigDecimal subtotal = itemDtos.stream().map(CartItemDto::lineTotal).reduce(BigDecimal.ZERO, BigDecimal::add);

        return new CartResponse(itemDtos, new CartSummaryDto(itemCount, subtotal));
    }

    private CartItemDto toItemDto(CartItem cartItem, ProductSummaryDto product) {
        BigDecimal effectivePrice = product.discountedPrice() != null ? product.discountedPrice() : product.basePrice();
        BigDecimal lineTotal = effectivePrice.multiply(BigDecimal.valueOf(cartItem.getQuantity()));
        return new CartItemDto(product, cartItem.getQuantity(), lineTotal);
    }

    private UUID resolveUserId(String email) {
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> ResourceNotFoundException.of("User", "email", email));
        return user.getId();
    }
}
