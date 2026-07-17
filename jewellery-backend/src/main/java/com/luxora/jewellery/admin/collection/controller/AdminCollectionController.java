package com.luxora.jewellery.admin.collection.controller;

import com.luxora.jewellery.admin.collection.dto.AdminCollectionRequest;
import com.luxora.jewellery.admin.collection.service.AdminCollectionService;
import com.luxora.jewellery.collection.dto.CollectionDto;
import com.luxora.jewellery.common.dto.ApiResponse;
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

@Tag(name = "Admin - Collections", description = "Admin-only collection management (ROLE_ADMIN)")
@RestController
@RequestMapping("/api/v1/admin/collections")
@RequiredArgsConstructor
public class AdminCollectionController {

    private final AdminCollectionService adminCollectionService;

    @GetMapping
    public ApiResponse<List<CollectionDto>> list() {
        return ApiResponse.ok(adminCollectionService.listAll());
    }

    @GetMapping("/{id}")
    public ApiResponse<CollectionDto> get(@PathVariable UUID id) {
        return ApiResponse.ok(adminCollectionService.get(id));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CollectionDto>> create(@Valid @RequestBody AdminCollectionRequest request) {
        CollectionDto created = adminCollectionService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Collection created", created));
    }

    @PutMapping("/{id}")
    public ApiResponse<CollectionDto> update(@PathVariable UUID id, @Valid @RequestBody AdminCollectionRequest request) {
        return ApiResponse.ok("Collection updated", adminCollectionService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable UUID id) {
        adminCollectionService.delete(id);
        return ApiResponse.ok("Collection deleted", null);
    }
}
