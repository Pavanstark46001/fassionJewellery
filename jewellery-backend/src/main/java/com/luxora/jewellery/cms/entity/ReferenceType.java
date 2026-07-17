package com.luxora.jewellery.cms.entity;

/**
 * What kind of entity a {@link HomeSectionItem#getReferenceId()} points at.
 * Deliberately a single loose polymorphic (type, id) pair rather than five
 * nullable FK columns, so new referenceable entity kinds don't require a
 * schema change.
 */
public enum ReferenceType {
    CATEGORY,
    SUBCATEGORY,
    COLLECTION,
    OCCASION,
    PRODUCT
}
