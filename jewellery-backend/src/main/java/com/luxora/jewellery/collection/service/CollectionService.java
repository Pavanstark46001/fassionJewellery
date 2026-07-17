package com.luxora.jewellery.collection.service;

import com.luxora.jewellery.collection.dto.CollectionDto;
import com.luxora.jewellery.collection.entity.Collection;
import com.luxora.jewellery.collection.mapper.CollectionMapper;
import com.luxora.jewellery.collection.repository.CollectionRepository;
import com.luxora.jewellery.common.dto.PageResponse;
import com.luxora.jewellery.common.exception.ResourceNotFoundException;
import com.luxora.jewellery.product.dto.ProductSummaryDto;
import com.luxora.jewellery.product.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CollectionService {

    private final CollectionRepository collectionRepository;
    private final CollectionMapper collectionMapper;
    private final ProductService productService;

    @Cacheable(value = "collections", key = "#featured")
    public List<CollectionDto> getCollections(Boolean featured) {
        List<Collection> collections = Boolean.TRUE.equals(featured)
                ? collectionRepository.findByIsActiveTrueAndIsFeaturedTrueOrderByDisplayOrderAsc()
                : collectionRepository.findByIsActiveTrueOrderByDisplayOrderAsc();
        return collections.stream().map(collectionMapper::toDto).toList();
    }

    @Cacheable(value = "collections", key = "#slug")
    public CollectionDto getCollectionBySlug(String slug) {
        Collection collection = collectionRepository.findBySlug(slug)
                .orElseThrow(() -> ResourceNotFoundException.of("Collection", "slug", slug));
        return collectionMapper.toDto(collection);
    }

    public PageResponse<ProductSummaryDto> getProductsByCollectionSlug(String slug, Pageable pageable) {
        // Validate the collection exists (and is reachable) before delegating,
        // so an unknown slug 404s instead of silently returning an empty page.
        collectionRepository.findBySlug(slug)
                .orElseThrow(() -> ResourceNotFoundException.of("Collection", "slug", slug));
        return productService.getProductsByCollectionSlug(slug, pageable);
    }
}
