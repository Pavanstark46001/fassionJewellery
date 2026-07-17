package com.luxora.jewellery.category.repository;

import com.luxora.jewellery.category.entity.SubCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SubCategoryRepository extends JpaRepository<SubCategory, UUID> {

    Optional<SubCategory> findBySlug(String slug);

    List<SubCategory> findByCategory_IdOrderByDisplayOrderAsc(UUID categoryId);

    List<SubCategory> findByCategory_IdAndIsActiveTrueOrderByDisplayOrderAsc(UUID categoryId);
}
