package com.luxora.jewellery.admin.cms.controller;

import com.luxora.jewellery.admin.cms.dto.AdminHomeSectionDto;
import com.luxora.jewellery.admin.cms.dto.AdminHomeSectionItemDto;
import com.luxora.jewellery.admin.cms.dto.AdminHomeSectionItemRequest;
import com.luxora.jewellery.admin.cms.dto.AdminHomeSectionRequest;
import com.luxora.jewellery.admin.cms.dto.AdminReorderRequest;
import com.luxora.jewellery.admin.cms.service.AdminHomeSectionService;
import com.luxora.jewellery.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@Tag(name = "Admin - CMS Home Sections", description = "Admin-only homepage section + item management (ROLE_ADMIN)")
@RestController
@RequestMapping("/api/v1/admin/cms/home-sections")
@RequiredArgsConstructor
public class AdminHomeSectionController {

    private final AdminHomeSectionService adminHomeSectionService;

    @GetMapping
    public ApiResponse<List<AdminHomeSectionDto>> list() {
        return ApiResponse.ok(adminHomeSectionService.listAll());
    }

    @GetMapping("/{id}")
    public ApiResponse<AdminHomeSectionDto> get(@PathVariable UUID id) {
        return ApiResponse.ok(adminHomeSectionService.get(id));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AdminHomeSectionDto>> create(
            @Valid @RequestBody AdminHomeSectionRequest request) {
        AdminHomeSectionDto created = adminHomeSectionService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Home section created", created));
    }

    @PutMapping("/{id}")
    public ApiResponse<AdminHomeSectionDto> update(
            @PathVariable UUID id, @Valid @RequestBody AdminHomeSectionRequest request) {
        return ApiResponse.ok("Home section updated", adminHomeSectionService.update(id, request));
    }

    @PatchMapping("/{id}/reorder")
    public ApiResponse<AdminHomeSectionDto> reorder(
            @PathVariable UUID id, @Valid @RequestBody AdminReorderRequest request) {
        return ApiResponse.ok("Home section reordered", adminHomeSectionService.reorder(id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable UUID id) {
        adminHomeSectionService.delete(id);
        return ApiResponse.ok("Home section deleted", null);
    }

    @GetMapping("/{sectionId}/items")
    public ApiResponse<List<AdminHomeSectionItemDto>> listItems(@PathVariable UUID sectionId) {
        return ApiResponse.ok(adminHomeSectionService.listItems(sectionId));
    }

    @PostMapping("/{sectionId}/items")
    public ResponseEntity<ApiResponse<AdminHomeSectionItemDto>> addItem(
            @PathVariable UUID sectionId, @Valid @RequestBody AdminHomeSectionItemRequest request) {
        AdminHomeSectionItemDto created = adminHomeSectionService.addItem(sectionId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Home section item added", created));
    }

    @PutMapping("/{sectionId}/items/{itemId}")
    public ApiResponse<AdminHomeSectionItemDto> updateItem(
            @PathVariable UUID sectionId, @PathVariable UUID itemId,
            @Valid @RequestBody AdminHomeSectionItemRequest request) {
        return ApiResponse.ok("Home section item updated",
                adminHomeSectionService.updateItem(sectionId, itemId, request));
    }

    @DeleteMapping("/{sectionId}/items/{itemId}")
    public ApiResponse<Void> deleteItem(@PathVariable UUID sectionId, @PathVariable UUID itemId) {
        adminHomeSectionService.deleteItem(sectionId, itemId);
        return ApiResponse.ok("Home section item removed", null);
    }
}
