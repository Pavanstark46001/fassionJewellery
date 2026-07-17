package com.luxora.jewellery.common.exception;

import org.springframework.http.HttpStatus;

/**
 * Thrown when a requested resource (by id, slug, etc.) cannot be found.
 */
public class ResourceNotFoundException extends ApiException {

    public ResourceNotFoundException(String message) {
        super(message, HttpStatus.NOT_FOUND);
    }

    public static ResourceNotFoundException of(String resourceName, String field, Object value) {
        return new ResourceNotFoundException(
                "%s not found with %s = '%s'".formatted(resourceName, field, value));
    }
}
