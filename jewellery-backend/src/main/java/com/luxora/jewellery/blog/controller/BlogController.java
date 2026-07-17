package com.luxora.jewellery.blog.controller;

import com.luxora.jewellery.blog.dto.BlogPostDto;
import com.luxora.jewellery.blog.dto.BlogPostSummaryDto;
import com.luxora.jewellery.blog.service.BlogPostService;
import com.luxora.jewellery.common.dto.ApiResponse;
import com.luxora.jewellery.common.dto.PageResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Blog", description = "Public blog: published posts only")
@RestController
@RequestMapping("/api/v1/blog")
@RequiredArgsConstructor
public class BlogController {

    private final BlogPostService blogPostService;

    @GetMapping
    public ApiResponse<PageResponse<BlogPostSummaryDto>> list(Pageable pageable) {
        return ApiResponse.ok(blogPostService.listPublished(pageable));
    }

    @GetMapping("/{slug}")
    public ApiResponse<BlogPostDto> getBySlug(@PathVariable String slug) {
        return ApiResponse.ok(blogPostService.getPublishedBySlug(slug));
    }
}
