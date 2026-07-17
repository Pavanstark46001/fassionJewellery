package com.luxora.jewellery.product.entity;

import com.luxora.jewellery.common.entity.BaseEntity;
import com.luxora.jewellery.occasion.entity.Occasion;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

/**
 * Join entity linking a {@link Product} to an {@link Occasion} (many-to-many).
 */
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "product_occasions")
@SQLDelete(sql = "UPDATE product_occasions SET is_deleted = true, deleted_date = now() WHERE id = ? AND version = ?")
@SQLRestriction("is_deleted = false")
public class ProductOccasion extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "occasion_id", nullable = false)
    private Occasion occasion;
}
