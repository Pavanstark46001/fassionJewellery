package com.luxora.jewellery.product.entity;

import com.luxora.jewellery.category.entity.Category;
import com.luxora.jewellery.category.entity.SubCategory;
import com.luxora.jewellery.common.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import java.math.BigDecimal;

/**
 * A sellable jewellery item ("ornament"). Phase 1 exposes this only via
 * read-only browse/search endpoints - stock/inventory management and
 * cart/checkout are future phases.
 */
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "products")
@SQLDelete(sql = "UPDATE products SET is_deleted = true, deleted_date = now() WHERE id = ? AND version = ?")
@SQLRestriction("is_deleted = false")
public class Product extends BaseEntity {

    @Column(name = "ornament_id", nullable = false, unique = true, length = 50)
    private String ornamentId;

    @Column(name = "name", nullable = false, length = 255)
    private String name;

    @Column(name = "slug", nullable = false, unique = true, length = 280)
    private String slug;

    @Column(name = "short_description")
    private String shortDescription;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "base_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal basePrice;

    @Column(name = "discounted_price", precision = 12, scale = 2)
    private BigDecimal discountedPrice;

    @Enumerated(EnumType.STRING)
    @Column(name = "metal_type", nullable = false, length = 30)
    private MetalType metalType;

    @Column(name = "weight_grams", precision = 8, scale = 2)
    private BigDecimal weightGrams;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sub_category_id")
    private SubCategory subCategory;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean isActive = true;

    @Column(name = "is_featured", nullable = false)
    @Builder.Default
    private boolean isFeatured = false;

    /** Coarse, manually-set storefront badge/purchasability flag. Sprint 8
     * complements this with real {@code stockQuantity} tracking below - this
     * enum is no longer the only source of truth, but is kept as-is (rather
     * than removed) since the storefront still reads it directly for badges,
     * and {@link com.luxora.jewellery.inventory.service.InventoryService}
     * auto-flips it based on the tracked quantity as stock moves. */
    @Enumerated(EnumType.STRING)
    @Column(name = "stock_status", nullable = false, length = 20)
    @Builder.Default
    private StockStatus stockStatus = StockStatus.IN_STOCK;

    /** Sprint 8: real per-product quantity on hand. A simple
     * single-location-per-product model (one warehouse/rack/shelf per
     * product) - not a full multi-warehouse ledger, which is out of scope
     * for this sprint. Decremented by {@code InventoryService.deductStock}
     * on every WEB/POS sale, incremented by manual purchase/return entries. */
    @Column(name = "stock_quantity", nullable = false)
    @Builder.Default
    private int stockQuantity = 0;

    /** Threshold at/below which the product is considered low stock (see
     * {@code InventoryService} and the admin {@code lowStockOnly} filter). */
    @Column(name = "low_stock_threshold", nullable = false)
    @Builder.Default
    private int lowStockThreshold = 5;

    @Column(name = "warehouse_name", length = 100)
    private String warehouseName;

    @Column(name = "rack_code", length = 50)
    private String rackCode;

    @Column(name = "shelf_code", length = 50)
    private String shelfCode;

    @Column(name = "meta_title")
    private String metaTitle;

    @Column(name = "meta_description")
    private String metaDescription;
}
