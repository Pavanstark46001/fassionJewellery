package com.luxora.jewellery.cms.repository;

import com.luxora.jewellery.cms.entity.HomeSectionItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface HomeSectionItemRepository extends JpaRepository<HomeSectionItem, UUID> {

    List<HomeSectionItem> findByHomeSection_IdOrderByDisplayOrderAsc(UUID homeSectionId);
}
