package com.luxora.jewellery.product.repository;

import com.luxora.jewellery.product.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProductRepository extends JpaRepository<Product, UUID>, JpaSpecificationExecutor<Product> {

    Optional<Product> findBySlugAndIsActiveTrue(String slug);

    /** Unpaged, slug-only-ish scan used by the sitemap generator (Sprint 7). */
    List<Product> findByIsActiveTrue();

    Optional<Product> findByOrnamentIdAndIsActiveTrue(String ornamentId);

    boolean existsByIdAndIsActiveTrue(UUID id);

    /** Unscoped by {@code isActive} - used by the admin API, which must be
     * able to look up/edit inactive products by slug too. */
    Optional<Product> findBySlug(String slug);

    /**
     * Next numeric suffix for a new {@code ORN-NNNNNN} ornament id, derived
     * from the highest existing one rather than a dedicated DB sequence
     * (ornament ids predate this admin API and were seeded by hand).
     */
    @Query(value = "SELECT COALESCE(MAX(CAST(SUBSTRING(ornament_id FROM 5) AS INTEGER)), 0) "
            + "FROM products WHERE is_deleted = false AND ornament_id ~ '^ORN-[0-9]+$'", nativeQuery = true)
    long findMaxOrnamentSuffix();
}
