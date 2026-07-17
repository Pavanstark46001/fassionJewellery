package com.luxora.jewellery.inventory.repository;

import com.luxora.jewellery.inventory.entity.StockMovement;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface StockMovementRepository extends JpaRepository<StockMovement, UUID> {

    Page<StockMovement> findAllByOrderByCreatedDateDesc(Pageable pageable);

    Page<StockMovement> findByProductIdOrderByCreatedDateDesc(UUID productId, Pageable pageable);
}
