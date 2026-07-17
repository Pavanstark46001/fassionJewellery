package com.luxora.jewellery.common.exception;

import org.springframework.http.HttpStatus;

/**
 * Generic application exception carrying an HTTP status to respond with.
 */
public class ApiException extends RuntimeException {

    private final HttpStatus status;

    public ApiException(String message, HttpStatus status) {
        super(message);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }
}
