package com.luxora.jewellery.product.specification;

import com.luxora.jewellery.product.entity.MetalType;
import com.luxora.jewellery.product.entity.Product;
import com.luxora.jewellery.product.entity.ProductCollection;
import com.luxora.jewellery.product.entity.ProductOccasion;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Subquery;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Composable JPA {@link Specification} predicates backing
 * {@code GET /api/v1/products}. Every method here is a pure filter that
 * {@link com.luxora.jewellery.product.service.ProductService} combines based
 * on which query parameters were actually supplied.
 */
public final class ProductSpecifications {

    private ProductSpecifications() {
    }

    public static Specification<Product> isActive() {
        return (root, query, cb) -> cb.isTrue(root.get("isActive"));
    }

    public static Specification<Product> isFeatured(Boolean featured) {
        return (root, query, cb) -> featured == null ? null : cb.equal(root.get("isFeatured"), featured);
    }

    /**
     * Optional {@code isActive} filter for the admin product list - unlike
     * {@link #isActive()} this does not force a value, so a null filter
     * (the default) returns products regardless of active state.
     */
    public static Specification<Product> hasIsActive(Boolean isActive) {
        return (root, query, cb) -> isActive == null ? null : cb.equal(root.get("isActive"), isActive);
    }

    /**
     * Sprint 8: filters the admin inventory list down to products at or
     * below their configured low-stock threshold. A no-op filter (returns
     * everything) when {@code lowStockOnly} is false, matching the
     * null-predicate-means-"no filter" idiom used throughout this class.
     */
    public static Specification<Product> isLowStock(boolean lowStockOnly) {
        return (root, query, cb) -> lowStockOnly
                ? cb.le(root.get("stockQuantity"), root.get("lowStockThreshold"))
                : null;
    }

    public static Specification<Product> hasCategorySlug(String categorySlug) {
        return (root, query, cb) -> categorySlug == null ? null
                : cb.equal(root.get("category").get("slug"), categorySlug);
    }

    public static Specification<Product> hasSubCategorySlug(String subCategorySlug) {
        return (root, query, cb) -> subCategorySlug == null ? null
                : cb.equal(root.get("subCategory").get("slug"), subCategorySlug);
    }

    public static Specification<Product> hasMetalType(MetalType metalType) {
        return (root, query, cb) -> metalType == null ? null : cb.equal(root.get("metalType"), metalType);
    }

    public static Specification<Product> priceGreaterThanOrEqual(BigDecimal minPrice) {
        return (root, query, cb) -> minPrice == null ? null
                : cb.greaterThanOrEqualTo(effectivePrice(root, cb), minPrice);
    }

    public static Specification<Product> priceLessThanOrEqual(BigDecimal maxPrice) {
        return (root, query, cb) -> maxPrice == null ? null
                : cb.lessThanOrEqualTo(effectivePrice(root, cb), maxPrice);
    }

    public static Specification<Product> nameContains(String q) {
        return (root, query, cb) -> {
            if (q == null || q.isBlank()) {
                return null;
            }
            String pattern = "%" + q.trim().toLowerCase() + "%";
            return cb.or(
                    cb.like(cb.lower(root.get("name")), pattern),
                    cb.like(cb.lower(root.get("shortDescription")), pattern)
            );
        };
    }

    public static Specification<Product> inCollectionSlug(String collectionSlug) {
        return (root, query, cb) -> {
            if (collectionSlug == null) {
                return null;
            }
            Subquery<Long> subquery = query.subquery(Long.class);
            var pc = subquery.from(ProductCollection.class);
            subquery.select(cb.literal(1L))
                    .where(cb.equal(pc.get("product"), root), cb.equal(pc.get("collection").get("slug"), collectionSlug));
            return cb.exists(subquery);
        };
    }

    public static Specification<Product> inOccasionSlug(String occasionSlug) {
        return (root, query, cb) -> {
            if (occasionSlug == null) {
                return null;
            }
            Subquery<Long> subquery = query.subquery(Long.class);
            var po = subquery.from(ProductOccasion.class);
            subquery.select(cb.literal(1L))
                    .where(cb.equal(po.get("product"), root), cb.equal(po.get("occasion").get("slug"), occasionSlug));
            return cb.exists(subquery);
        };
    }

    /**
     * Products "related" to a given product: sharing its category or any of
     * its collections, excluding the product itself. Backs
     * {@code GET /api/v1/products/{slug}/related}.
     */
    public static Specification<Product> isRelatedTo(UUID excludeProductId, UUID categoryId, List<UUID> collectionIds) {
        return (root, query, cb) -> {
            List<Predicate> matches = new ArrayList<>();
            if (categoryId != null) {
                matches.add(cb.equal(root.get("category").get("id"), categoryId));
            }
            if (collectionIds != null && !collectionIds.isEmpty()) {
                Subquery<Long> subquery = query.subquery(Long.class);
                var pc = subquery.from(ProductCollection.class);
                subquery.select(cb.literal(1L))
                        .where(cb.equal(pc.get("product"), root), pc.get("collection").get("id").in(collectionIds));
                matches.add(cb.exists(subquery));
            }
            if (matches.isEmpty()) {
                return cb.disjunction();
            }
            return cb.and(cb.notEqual(root.get("id"), excludeProductId), cb.or(matches.toArray(new Predicate[0])));
        };
    }

    /**
     * The price customers actually pay: discounted price when present,
     * otherwise the base price. Used so min/max price filters behave
     * intuitively against what's shown on the storefront.
     */
    private static jakarta.persistence.criteria.Expression<BigDecimal> effectivePrice(
            jakarta.persistence.criteria.Root<Product> root,
            jakarta.persistence.criteria.CriteriaBuilder cb) {
        return cb.coalesce(root.get("discountedPrice"), root.get("basePrice"));
    }
}
