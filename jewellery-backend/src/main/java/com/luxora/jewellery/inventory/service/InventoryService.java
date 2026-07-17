package com.luxora.jewellery.inventory.service;

import com.luxora.jewellery.common.exception.ApiException;
import com.luxora.jewellery.common.exception.ResourceNotFoundException;
import com.luxora.jewellery.inventory.entity.MovementType;
import com.luxora.jewellery.inventory.entity.StockMovement;
import com.luxora.jewellery.inventory.repository.StockMovementRepository;
import com.luxora.jewellery.product.entity.Product;
import com.luxora.jewellery.product.entity.StockStatus;
import com.luxora.jewellery.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Sprint 8: the single place that ever changes a product's tracked {@code
 * stockQuantity}. Both {@code OrderService.placeOrder} (WEB checkout) and
 * {@code PosService.createSale} (in-store billing) call {@link
 * #deductStock} once per line item at order/sale creation time - both flows
 * already treat the order as immediately placed/confirmed at that point, so
 * there is no separate "shipped" step to hook into instead. The admin
 * inventory API calls {@link #recordMovement} for manual purchase/damage/
 * return/transfer entries.
 *
 * <p>Design choice - overselling: a sale is rejected outright (400) if the
 * requested quantity exceeds what's currently on hand, rather than allowing
 * stock to go negative and flagging it after the fact. This is the simpler
 * of the two reasonable options for this sprint (no backorder/oversell
 * ledger needed) and matches how a physical till would behave.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class InventoryService {

    private final ProductRepository productRepository;
    private final StockMovementRepository stockMovementRepository;

    /**
     * Decrements stock for a single sold line item and records a {@code
     * SALE_DEDUCTION} movement. Throws (rolling back the caller's order
     * transaction) if there isn't enough stock on hand.
     */
    @Transactional
    public void deductStock(UUID productId, int quantity, String referenceOrderNumber) {
        if (quantity <= 0) {
            throw new ApiException("quantity to deduct must be positive", HttpStatus.BAD_REQUEST);
        }
        Product product = findProduct(productId);
        if (product.getStockQuantity() < quantity) {
            throw new ApiException(
                    "\"%s\" only has %d unit(s) in stock (requested %d)"
                            .formatted(product.getName(), product.getStockQuantity(), quantity),
                    HttpStatus.BAD_REQUEST);
        }
        applyMovement(product, MovementType.SALE_DEDUCTION, -quantity,
                "Sale deduction for order " + referenceOrderNumber, referenceOrderNumber);
    }

    /**
     * Records a manual stock movement (purchase entry, damage write-off,
     * return, or transfer note) from the admin inventory API. {@code
     * quantityChange} is signed by the caller - positive for
     * purchase/return entries, negative for damage - so this one method
     * covers every manual movement type without duplicating logic.
     */
    @Transactional
    public StockMovement recordMovement(UUID productId, MovementType type, int quantityChange, String note) {
        if (quantityChange == 0) {
            throw new ApiException("quantityChange must not be zero", HttpStatus.BAD_REQUEST);
        }
        Product product = findProduct(productId);
        return applyMovement(product, type, quantityChange, note, null);
    }

    private StockMovement applyMovement(Product product, MovementType type, int quantityChange, String note,
                                         String referenceOrderNumber) {
        int newQuantity = product.getStockQuantity() + quantityChange;
        product.setStockQuantity(newQuantity);

        // Auto-flip the coarse storefront badge based on the new tracked
        // quantity, but only when it's currently reflecting a stock-driven
        // state - an admin-set COMING_SOON stays untouched by inventory
        // movements.
        if (newQuantity <= 0) {
            product.setStockStatus(StockStatus.OUT_OF_STOCK);
        } else if (newQuantity <= product.getLowStockThreshold()) {
            product.setStockStatus(StockStatus.LOW_STOCK);
        } else if (product.getStockStatus() == StockStatus.OUT_OF_STOCK
                || product.getStockStatus() == StockStatus.LOW_STOCK) {
            product.setStockStatus(StockStatus.IN_STOCK);
        }
        productRepository.save(product);

        StockMovement movement = StockMovement.builder()
                .productId(product.getId())
                .movementType(type)
                .quantityChange(quantityChange)
                .note(note)
                .referenceOrderNumber(referenceOrderNumber)
                .build();
        return stockMovementRepository.save(movement);
    }

    private Product findProduct(UUID productId) {
        return productRepository.findById(productId)
                .orElseThrow(() -> ResourceNotFoundException.of("Product", "id", productId));
    }
}
