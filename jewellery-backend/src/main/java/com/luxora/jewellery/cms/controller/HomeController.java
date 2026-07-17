package com.luxora.jewellery.cms.controller;

import com.luxora.jewellery.cms.dto.BannerDto;
import com.luxora.jewellery.cms.dto.HomeSectionDto;
import com.luxora.jewellery.cms.service.BannerService;
import com.luxora.jewellery.cms.service.HomeSectionService;
import com.luxora.jewellery.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Tag(name = "Home", description = "Homepage CMS content: banners and fully-composed homepage sections")
@RestController
@RequestMapping("/api/v1/home")
@RequiredArgsConstructor
public class HomeController {

    private final BannerService bannerService;
    private final HomeSectionService homeSectionService;

    @GetMapping("/banners")
    public ApiResponse<List<BannerDto>> getBanners(
            @RequestParam(name = "activeOnly", defaultValue = "true") boolean activeOnly) {
        return ApiResponse.ok(bannerService.getBanners(activeOnly));
    }

    @GetMapping("/sections")
    public ApiResponse<List<HomeSectionDto>> getSections() {
        return ApiResponse.ok(homeSectionService.getHomeSections());
    }
}
