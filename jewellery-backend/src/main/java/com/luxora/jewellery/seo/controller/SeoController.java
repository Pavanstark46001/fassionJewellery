package com.luxora.jewellery.seo.controller;

import com.luxora.jewellery.seo.service.SitemapService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Search-engine endpoints. Deliberately mounted at the bare root
 * ({@code /sitemap.xml}, {@code /robots.txt}) rather than under
 * {@code /api/v1} - that's where crawlers expect them, and they return raw
 * XML/text, not the {@code ApiResponse} JSON envelope every other endpoint
 * uses (same reasoning as the PDF invoice endpoint returning raw bytes).
 */
@Tag(name = "SEO", description = "Public sitemap.xml and robots.txt")
@RestController
@RequiredArgsConstructor
public class SeoController {

    private final SitemapService sitemapService;

    @GetMapping(value = "/sitemap.xml", produces = MediaType.APPLICATION_XML_VALUE)
    public ResponseEntity<String> sitemap() {
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_XML)
                .body(sitemapService.generateSitemapXml());
    }

    @GetMapping(value = "/robots.txt", produces = MediaType.TEXT_PLAIN_VALUE)
    public ResponseEntity<String> robots() {
        return ResponseEntity.ok()
                .contentType(MediaType.TEXT_PLAIN)
                .body(sitemapService.generateRobotsTxt());
    }
}
