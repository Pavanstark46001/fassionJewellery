package com.luxora.jewellery.common.util;

import java.text.Normalizer;
import java.util.regex.Pattern;

/**
 * Small helper to derive URL-friendly slugs from display names.
 */
public final class SlugUtil {

    private static final Pattern NON_LATIN = Pattern.compile("[^\\w-]");
    private static final Pattern WHITESPACE = Pattern.compile("[\\s]+");
    private static final Pattern MULTI_DASH = Pattern.compile("-{2,}");

    private SlugUtil() {
    }

    public static String slugify(String input) {
        if (input == null) {
            return null;
        }
        String noWhitespace = WHITESPACE.matcher(input.trim()).replaceAll("-");
        String normalized = Normalizer.normalize(noWhitespace, Normalizer.Form.NFD);
        String slug = NON_LATIN.matcher(normalized).replaceAll("");
        slug = MULTI_DASH.matcher(slug).replaceAll("-");
        return slug.toLowerCase().replaceAll("^-+|-+$", "");
    }
}
