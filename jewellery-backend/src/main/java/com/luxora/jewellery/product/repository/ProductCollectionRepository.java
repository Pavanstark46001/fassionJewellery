package com.luxora.jewellery.product.repository;

import com.luxora.jewellery.product.entity.ProductCollection;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ProductCollectionRepository extends JpaRepository<ProductCollection, UUID> {

    List<ProductCollection> findByProduct_Id(UUID productId);
}
