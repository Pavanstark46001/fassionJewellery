package com.luxora.jewellery.cms.entity;

import com.luxora.jewellery.common.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

/**
 * A single homepage section (e.g. "Shop by Category", "Bridal Collection",
 * "New Arrivals"). Its actual content is the ordered list of
 * {@link HomeSectionItem} rows.
 */
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "home_sections")
@SQLDelete(sql = "UPDATE home_sections SET is_deleted = true, deleted_date = now() WHERE id = ? AND version = ?")
@SQLRestriction("is_deleted = false")
public class HomeSection extends BaseEntity {

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "subtitle")
    private String subtitle;

    @Enumerated(EnumType.STRING)
    @Column(name = "section_type", nullable = false, length = 30)
    private SectionType sectionType;

    @Column(name = "display_order")
    @Builder.Default
    private Integer displayOrder = 0;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean isActive = true;
}
