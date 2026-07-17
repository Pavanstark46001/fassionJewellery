package com.luxora.jewellery.common.util;

import com.luxora.jewellery.common.entity.BaseEntity;

import java.util.Optional;
import java.util.UUID;
import java.util.function.Function;

/**
 * Shared helper for admin create/update flows: derives a slug from a
 * requested value (falling back to a display name via {@link SlugUtil}),
 * then disambiguates it against an existing-lookup function by appending
 * {@code -2}, {@code -3}, ... until the candidate is free - or already
 * belongs to the entity being updated, identified by {@code excludeId}.
 */
public final class UniqueSlugResolver {

    private UniqueSlugResolver() {
    }

    public static String resolve(String requestedSlug, String fallbackName, UUID excludeId,
                                  Function<String, Optional<? extends BaseEntity>> lookup) {
        String base = SlugUtil.slugify(
                requestedSlug != null && !requestedSlug.isBlank() ? requestedSlug : fallbackName);
        String candidate = base;
        int suffix = 2;
        while (true) {
            Optional<? extends BaseEntity> existing = lookup.apply(candidate);
            if (existing.isEmpty() || existing.get().getId().equals(excludeId)) {
                return candidate;
            }
            candidate = base + "-" + suffix++;
        }
    }
}
