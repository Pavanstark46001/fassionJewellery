package com.luxora.jewellery.product.repository;

import com.luxora.jewellery.product.entity.ProductOccasion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ProductOccasionRepository extends JpaRepository<ProductOccasion, UUID> {

    List<ProductOccasion> findByProduct_Id(UUID productId);
}
