package com.luxora.jewellery.cms.repository;

import com.luxora.jewellery.cms.entity.HomeSection;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface HomeSectionRepository extends JpaRepository<HomeSection, UUID> {

    List<HomeSection> findByIsActiveTrueOrderByDisplayOrderAsc();

    /** Admin listing includes inactive sections too. */
    List<HomeSection> findAllByOrderByDisplayOrderAsc();
}
