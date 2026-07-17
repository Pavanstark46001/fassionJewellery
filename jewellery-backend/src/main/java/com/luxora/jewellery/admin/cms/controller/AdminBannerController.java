package com.luxora.jewellery.admin.cms.controller;

import com.luxora.jewellery.admin.cms.dto.AdminBannerRequest;
import com.luxora.jewellery.admin.cms.service.AdminBannerService;
import com.luxora.jewellery.cms.dto.BannerDto;
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

@Tag(name = "Admin - CMS Banners", description = "Admin-only homepage banner management (ROLE_ADMIN)")
@RestController
@RequestMapping("/api/v1/admin/cms/banners")
@RequiredArgsConstructor
public class AdminBannerController {

    private final AdminBannerService adminBannerService;

    @GetMapping
    public ApiResponse<List<BannerDto>> list() {
        return ApiResponse.ok(adminBannerService.listAll());
    }

    @GetMapping("/{id}")
    public ApiResponse<BannerDto> get(@PathVariable UUID id) {
        return ApiResponse.ok(adminBannerService.get(id));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<BannerDto>> create(@Valid @RequestBody AdminBannerRequest request) {
        BannerDto created = adminBannerService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Banner created", created));
    }

    @PutMapping("/{id}")
    public ApiResponse<BannerDto> update(@PathVariable UUID id, @Valid @RequestBody AdminBannerRequest request) {
        return ApiResponse.ok("Banner updated", adminBannerService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable UUID id) {
        adminBannerService.delete(id);
        return ApiResponse.ok("Banner deleted", null);
    }
}
