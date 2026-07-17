package com.luxora.jewellery.seo.service;

import com.luxora.jewellery.blog.repository.BlogPostRepository;
import com.luxora.jewellery.category.repository.CategoryRepository;
import com.luxora.jewellery.collection.repository.CollectionRepository;
import com.luxora.jewellery.page.repository.StaticPageRepository;
import com.luxora.jewellery.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

/**
 * Builds {@code sitemap.xml}/{@code robots.txt} from live catalog + CMS data.
 *
 * <p>URL patterns here are hand-matched to the real frontend routes in
 * {@code jewellery-frontend/src/routes/index.tsx}: categories browse under
 * {@code /collections/:categorySlug} (despite the "collections" path, that's
 * the category-by-slug route), the jewellery {@code Collection} entity has no
 * dedicated route yet and is only reachable via the {@code collectionSlug}
 * query param on {@code /products}, and products live at
 * {@code /products/:productSlug}. {@code /blog/:slug} and
 * {@code /pages/:slug} don't exist on the frontend yet - they're this
 * sprint's backend half of work the frontend will catch up to.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SitemapService {

    private final CategoryRepository categoryRepository;
    private final CollectionRepository collectionRepository;
    private final ProductRepository productRepository;
    private final BlogPostRepository blogPostRepository;
    private final StaticPageRepository staticPageRepository;

    @Value("${app.frontend-base-url}")
    private String frontendBaseUrl;

    public String generateSitemapXml() {
        String base = trimTrailingSlash(frontendBaseUrl);
        List<String> urls = new ArrayList<>();
        urls.add(base + "/");

        categoryRepository.findByIsActiveTrueOrderByDisplayOrderAsc()
                .forEach(category -> urls.add(base + "/collections/" + category.getSlug()));

        collectionRepository.findByIsActiveTrueOrderByDisplayOrderAsc()
                .forEach(collection -> urls.add(base + "/products?collectionSlug=" + collection.getSlug()));

        productRepository.findByIsActiveTrue()
                .forEach(product -> urls.add(base + "/products/" + product.getSlug()));

        blogPostRepository.findByIsPublishedTrueOrderByPublishedDateDesc()
                .forEach(post -> urls.add(base + "/blog/" + post.getSlug()));

        staticPageRepository.findAllByOrderByTitleAsc()
                .forEach(page -> urls.add(base + "/pages/" + page.getSlug()));

        StringBuilder xml = new StringBuilder();
        xml.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
        xml.append("<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n");
        for (String url : urls) {
            xml.append("  <url><loc>").append(escapeXml(url)).append("</loc></url>\n");
        }
        xml.append("</urlset>\n");
        return xml.toString();
    }

    public String generateRobotsTxt() {
        String base = trimTrailingSlash(frontendBaseUrl);
        return """
                User-agent: *
                Allow: /
                Sitemap: %s/sitemap.xml
                """.formatted(base);
    }

    private String trimTrailingSlash(String url) {
        return url.endsWith("/") ? url.substring(0, url.length() - 1) : url;
    }

    private String escapeXml(String value) {
        return value.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&apos;");
    }
}
