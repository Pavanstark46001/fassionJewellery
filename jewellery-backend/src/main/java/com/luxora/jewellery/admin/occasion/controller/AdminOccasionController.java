package com.luxora.jewellery.admin.occasion.controller;

import com.luxora.jewellery.admin.occasion.dto.AdminOccasionRequest;
import com.luxora.jewellery.admin.occasion.service.AdminOccasionService;
import com.luxora.jewellery.common.dto.ApiResponse;
import com.luxora.jewellery.occasion.dto.OccasionDto;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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

@Tag(name = "Admin - Occasions", description = "Admin-only occasion management (ROLE_ADMIN)")
@RestController
@RequestMapping("/api/v1/admin/occasions")
@RequiredArgsConstructor
public class AdminOccasionController {

    private final AdminOccasionService adminOccasionService;

    @GetMapping
    public ApiResponse<List<OccasionDto>> list() {
        return ApiResponse.ok(adminOccasionService.listAll());
    }

    @GetMapping("/{id}")
    public ApiResponse<OccasionDto> get(@PathVariable UUID id) {
        return ApiResponse.ok(adminOccasionService.get(id));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<OccasionDto>> create(@Valid @RequestBody AdminOccasionRequest request) {
        OccasionDto created = adminOccasionService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Occasion created", created));
    }

    @PutMapping("/{id}")
    public ApiResponse<OccasionDto> update(@PathVariable UUID id, @Valid @RequestBody AdminOccasionRequest request) {
        return ApiResponse.ok("Occasion updated", adminOccasionService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable UUID id) {
        adminOccasionService.delete(id);
        return ApiResponse.ok("Occasion deleted", null);
    }
}
