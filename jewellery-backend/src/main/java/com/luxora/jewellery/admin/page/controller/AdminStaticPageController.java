package com.luxora.jewellery.admin.page.controller;

import com.luxora.jewellery.admin.page.dto.AdminStaticPageRequest;
import com.luxora.jewellery.admin.page.service.AdminStaticPageService;
import com.luxora.jewellery.common.dto.ApiResponse;
import com.luxora.jewellery.page.dto.StaticPageDto;
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

@Tag(name = "Admin - Static Pages", description = "Admin-only static/legal page management (ROLE_ADMIN)")
@RestController
@RequestMapping("/api/v1/admin/pages")
@RequiredArgsConstructor
public class AdminStaticPageController {

    private final AdminStaticPageService adminStaticPageService;

    @GetMapping
    public ApiResponse<List<StaticPageDto>> list() {
        return ApiResponse.ok(adminStaticPageService.listAll());
    }

    @GetMapping("/{id}")
    public ApiResponse<StaticPageDto> get(@PathVariable UUID id) {
        return ApiResponse.ok(adminStaticPageService.get(id));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<StaticPageDto>> create(@Valid @RequestBody AdminStaticPageRequest request) {
        StaticPageDto created = adminStaticPageService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Static page created", created));
    }

    @PutMapping("/{id}")
    public ApiResponse<StaticPageDto> update(
            @PathVariable UUID id, @Valid @RequestBody AdminStaticPageRequest request) {
        return ApiResponse.ok("Static page updated", adminStaticPageService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable UUID id) {
        adminStaticPageService.delete(id);
        return ApiResponse.ok("Static page deleted", null);
    }
}
