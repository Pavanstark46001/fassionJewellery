package com.luxora.jewellery.page.controller;

import com.luxora.jewellery.common.dto.ApiResponse;
import com.luxora.jewellery.page.dto.StaticPageDto;
import com.luxora.jewellery.page.service.StaticPageService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Static Pages", description = "Public static/legal policy pages (privacy, terms, shipping, returns, ...)")
@RestController
@RequestMapping("/api/v1/pages")
@RequiredArgsConstructor
public class StaticPageController {

    private final StaticPageService staticPageService;

    @GetMapping("/{slug}")
    public ApiResponse<StaticPageDto> getBySlug(@PathVariable String slug) {
        return ApiResponse.ok(staticPageService.getBySlug(slug));
    }
}
