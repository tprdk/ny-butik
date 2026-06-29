package com.nybutik.module.catalog.controller;

import com.nybutik.module.catalog.enums.ProductStatus;
import com.nybutik.module.catalog.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
public class SitemapController {

    private final ProductRepository productRepository;

    @Value("${FRONTEND_URL:https://www.nybutik.com}")
    private String frontendUrl;

    @GetMapping(value = "/sitemap.xml", produces = MediaType.APPLICATION_XML_VALUE)
    public String sitemap() {
        String staticUrls = """
                <url><loc>%s/</loc><changefreq>daily</changefreq><priority>1.0</priority></url>
                <url><loc>%s/urunler</loc><changefreq>daily</changefreq><priority>0.9</priority></url>
                """.formatted(frontendUrl, frontendUrl);

        String productUrls = productRepository.findAll().stream()
                .filter(p -> ProductStatus.ACTIVE.equals(p.getStatus()))
                .map(p -> "<url><loc>%s/urunler/%s</loc><changefreq>weekly</changefreq><priority>0.8</priority><lastmod>%s</lastmod></url>"
                        .formatted(frontendUrl, p.getSlug(), LocalDate.now()))
                .collect(Collectors.joining("\n"));

        return """
                <?xml version="1.0" encoding="UTF-8"?>
                <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
                %s
                %s
                </urlset>
                """.formatted(staticUrls, productUrls);
    }
}
