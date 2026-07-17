package com.luxora.jewellery.admin.blog.controller;

import com.luxora.jewellery.admin.blog.dto.AdminBlogPostRequest;
import com.luxora.jewellery.admin.blog.service.AdminBlogPostService;
import com.luxora.jewellery.blog.dto.BlogPostDto;
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

@Tag(name = "Admin - Blog", description = "Admin-only blog post management, including drafts (ROLE_ADMIN)")
@RestController
@RequestMapping("/api/v1/admin/blog")
@RequiredArgsConstructor
public class AdminBlogPostController {

    private final AdminBlogPostService adminBlogPostService;

    @GetMapping
    public ApiResponse<List<BlogPostDto>> list() {
        return ApiResponse.ok(adminBlogPostService.listAll());
    }

    @GetMapping("/{id}")
    public ApiResponse<BlogPostDto> get(@PathVariable UUID id) {
        return ApiResponse.ok(adminBlogPostService.get(id));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<BlogPostDto>> create(@Valid @RequestBody AdminBlogPostRequest request) {
        BlogPostDto created = adminBlogPostService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Blog post created", created));
    }

    @PutMapping("/{id}")
    public ApiResponse<BlogPostDto> update(@PathVariable UUID id, @Valid @RequestBody AdminBlogPostRequest request) {
        return ApiResponse.ok("Blog post updated", adminBlogPostService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable UUID id) {
        adminBlogPostService.delete(id);
        return ApiResponse.ok("Blog post deleted", null);
    }
}
