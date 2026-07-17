package com.luxora.jewellery.address.controller;

import com.luxora.jewellery.address.dto.AddressDto;
import com.luxora.jewellery.address.dto.AddressRequest;
import com.luxora.jewellery.address.service.AddressService;
import com.luxora.jewellery.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@Tag(name = "Addresses", description = "Authenticated user's saved shipping/billing addresses")
@RestController
@RequestMapping("/api/v1/addresses")
@RequiredArgsConstructor
public class AddressController {

    private final AddressService addressService;

    @GetMapping
    public ApiResponse<List<AddressDto>> list(Authentication authentication) {
        return ApiResponse.ok(addressService.listForCurrentUser(authentication.getName()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AddressDto>> create(Authentication authentication,
                                                            @Valid @RequestBody AddressRequest request) {
        AddressDto created = addressService.create(authentication.getName(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Address created", created));
    }

    @PutMapping("/{id}")
    public ApiResponse<AddressDto> update(Authentication authentication, @PathVariable UUID id,
                                           @Valid @RequestBody AddressRequest request) {
        return ApiResponse.ok("Address updated", addressService.update(authentication.getName(), id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(Authentication authentication, @PathVariable UUID id) {
        addressService.delete(authentication.getName(), id);
        return ApiResponse.ok("Address deleted", null);
    }

    @PutMapping("/{id}/default")
    public ApiResponse<AddressDto> setDefault(Authentication authentication, @PathVariable UUID id) {
        return ApiResponse.ok("Default address updated", addressService.setDefault(authentication.getName(), id));
    }
}
