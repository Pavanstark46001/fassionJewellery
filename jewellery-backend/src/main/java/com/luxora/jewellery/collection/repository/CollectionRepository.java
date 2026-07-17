package com.luxora.jewellery.collection.repository;

import com.luxora.jewellery.collection.entity.Collection;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CollectionRepository extends JpaRepository<Collection, UUID> {

    Optional<Collection> findBySlug(String slug);

    List<Collection> findByIsActiveTrueOrderByDisplayOrderAsc();

    List<Collection> findByIsActiveTrueAndIsFeaturedTrueOrderByDisplayOrderAsc();

    /** Admin listing includes inactive collections too. */
    List<Collection> findAllByOrderByDisplayOrderAsc();
}
