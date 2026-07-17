package com.luxora.jewellery.page.repository;

import com.luxora.jewellery.page.entity.StaticPage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface StaticPageRepository extends JpaRepository<StaticPage, UUID> {

    Optional<StaticPage> findBySlug(String slug);

    List<StaticPage> findAllByOrderByTitleAsc();
}
