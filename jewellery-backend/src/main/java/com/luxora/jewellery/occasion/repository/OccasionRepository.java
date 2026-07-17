package com.luxora.jewellery.occasion.repository;

import com.luxora.jewellery.occasion.entity.Occasion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface OccasionRepository extends JpaRepository<Occasion, UUID> {

    Optional<Occasion> findBySlug(String slug);

    List<Occasion> findByIsActiveTrueOrderByDisplayOrderAsc();

    /** Admin listing includes inactive occasions too. */
    List<Occasion> findAllByOrderByDisplayOrderAsc();
}
