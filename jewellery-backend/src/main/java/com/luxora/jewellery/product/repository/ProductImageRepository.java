package com.luxora.jewellery.product.repository;

import com.luxora.jewellery.product.entity.ProductImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ProductImageRepository extends JpaRepository<ProductImage, UUID> {

    List<ProductImage> findByProduct_IdOrderByDisplayOrderAsc(UUID productId);

    List<ProductImage> findByProduct_IdInOrderByDisplayOrderAsc(List<UUID> productIds);
}
