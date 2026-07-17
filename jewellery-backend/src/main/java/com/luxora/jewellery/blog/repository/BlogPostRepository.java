package com.luxora.jewellery.blog.repository;

import com.luxora.jewellery.blog.entity.BlogPost;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface BlogPostRepository extends JpaRepository<BlogPost, UUID> {

    Optional<BlogPost> findBySlugAndIsPublishedTrue(String slug);

    /** Unscoped by {@code isPublished} - the admin API can look up drafts too. */
    Optional<BlogPost> findBySlug(String slug);

    Page<BlogPost> findByIsPublishedTrueOrderByPublishedDateDesc(Pageable pageable);

    /** Unpaged variant for the sitemap generator. */
    List<BlogPost> findByIsPublishedTrueOrderByPublishedDateDesc();

    /** Admin listing includes unpublished drafts too. */
    List<BlogPost> findAllByOrderByCreatedDateDesc();
}
