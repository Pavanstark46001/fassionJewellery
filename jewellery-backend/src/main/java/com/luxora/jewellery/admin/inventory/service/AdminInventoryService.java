package com.luxora.jewellery.admin.inventory.service;

import com.luxora.jewellery.admin.inventory.dto.AdminProductInventoryDto;
import com.luxora.jewellery.admin.inventory.dto.InventoryLocationRequest;
import com.luxora.jewellery.admin.inventory.dto.StockMovementDto;
import com.luxora.jewellery.admin.inventory.dto.StockMovementRequest;
import com.luxora.jewellery.common.dto.PageResponse;
import com.luxora.jewellery.common.exception.ResourceNotFoundException;
import com.luxora.jewellery.inventory.entity.StockMovement;
import com.luxora.jewellery.inventory.repository.StockMovementRepository;
import com.luxora.jewellery.inventory.service.InventoryService;
import com.luxora.jewellery.product.entity.Product;
import com.luxora.jewellery.product.repository.ProductRepository;
import com.luxora.jewellery.product.specification.ProductSpecifications;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;

/**
 * Admin-only orchestration over inventory: the product location/quantity
 * list, warehouse placement edits, and the manual movement log. Actual
 * quantity mutation is delegated to {@link InventoryService} so the
 * quantity-changing logic (and the OUT_OF_STOCK/LOW_STOCK auto-flip) lives
 * in exactly one place, shared with the WEB/POS sale-deduction path.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminInventoryService {

    private final ProductRepository productRepository;
    private final StockMovementRepository stockMovementRepository;
    private final InventoryService inventoryService;

    public PageResponse<AdminProductInventoryDto> listInventory(String q, boolean lowStockOnly, Pageable pageable) {
        Specification<Product> spec = Specification.allOf(
                ProductSpecifications.nameContains(q),
                ProductSpecifications.isLowStock(lowStockOnly));
        Page<Product> page = productRepository.findAll(spec, pageable);
        return PageResponse.from(page, page.getContent().stream().map(this::toInventoryDto).toList());
    }

    @Transactional
    public AdminProductInventoryDto setLocation(UUID productId, InventoryLocationRequest request) {
        Product product = findProduct(productId);
        product.setWarehouseName(request.warehouseName());
        product.setRackCode(request.rackCode());
        product.setShelfCode(request.shelfCode());
        product = productRepository.save(product);
        return toInventoryDto(product);
    }

    @Transactional
    public StockMovementDto recordMovement(StockMovementRequest request) {
        StockMovement movement = inventoryService.recordMovement(
                request.productId(), request.movementType(), request.quantityChange(), request.note());
        return toMovementDto(movement, Map.of(movement.getProductId(), findProduct(movement.getProductId())));
    }

    public PageResponse<StockMovementDto> listMovements(UUID productId, Pageable pageable) {
        Page<StockMovement> page = productId != null
                ? stockMovementRepository.findByProductIdOrderByCreatedDateDesc(productId, pageable)
                : stockMovementRepository.findAllByOrderByCreatedDateDesc(pageable);

        var productIds = page.getContent().stream().map(StockMovement::getProductId).distinct().toList();
        Map<UUID, Product> productsById = productRepository.findAllById(productIds).stream()
                .collect(java.util.stream.Collectors.toMap(Product::getId, p -> p));

        return PageResponse.from(page, page.getContent().stream()
                .map(movement -> toMovementDto(movement, productsById))
                .toList());
    }

    private AdminProductInventoryDto toInventoryDto(Product product) {
        return new AdminProductInventoryDto(
                product.getId(),
                product.getOrnamentId(),
                product.getName(),
                product.getStockQuantity(),
                product.getLowStockThreshold(),
                product.getStockStatus(),
                product.getWarehouseName(),
                product.getRackCode(),
                product.getShelfCode());
    }

    private StockMovementDto toMovementDto(StockMovement movement, Map<UUID, Product> productsById) {
        Product product = productsById.get(movement.getProductId());
        return new StockMovementDto(
                movement.getId(),
                movement.getProductId(),
                product != null ? product.getOrnamentId() : null,
                product != null ? product.getName() : null,
                movement.getMovementType(),
                movement.getQuantityChange(),
                movement.getNote(),
                movement.getReferenceOrderNumber(),
                movement.getCreatedBy(),
                movement.getCreatedDate());
    }

    private Product findProduct(UUID productId) {
        return productRepository.findById(productId)
                .orElseThrow(() -> ResourceNotFoundException.of("Product", "id", productId));
    }
}
