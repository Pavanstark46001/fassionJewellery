package com.luxora.jewellery.page.entity;

import com.luxora.jewellery.common.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

/**
 * A static/legal policy page (privacy policy, terms of service, shipping
 * policy, return policy, ...). Named {@code StaticPage} rather than
 * {@code Page} to avoid clashing with {@code common.dto.PageResponse}-style
 * "page" naming used elsewhere for pagination.
 */
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "static_pages")
@SQLDelete(sql = "UPDATE static_pages SET is_deleted = true, deleted_date = now() WHERE id = ? AND version = ?")
@SQLRestriction("is_deleted = false")
public class StaticPage extends BaseEntity {

    @Column(name = "slug", nullable = false, unique = true, length = 170)
    private String slug;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "meta_title")
    private String metaTitle;

    @Column(name = "meta_description")
    private String metaDescription;
}
