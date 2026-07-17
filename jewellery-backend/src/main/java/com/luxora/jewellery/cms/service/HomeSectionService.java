package com.luxora.jewellery.cms.service;

import com.luxora.jewellery.category.mapper.CategoryMapper;
import com.luxora.jewellery.category.repository.CategoryRepository;
import com.luxora.jewellery.category.repository.SubCategoryRepository;
import com.luxora.jewellery.cms.dto.HomeSectionDto;
import com.luxora.jewellery.cms.dto.HomeSectionItemDto;
import com.luxora.jewellery.cms.entity.HomeSection;
import com.luxora.jewellery.cms.entity.HomeSectionItem;
import com.luxora.jewellery.cms.mapper.HomeSectionMapper;
import com.luxora.jewellery.cms.repository.HomeSectionItemRepository;
import com.luxora.jewellery.cms.repository.HomeSectionRepository;
import com.luxora.jewellery.collection.mapper.CollectionMapper;
import com.luxora.jewellery.collection.repository.CollectionRepository;
import com.luxora.jewellery.occasion.mapper.OccasionMapper;
import com.luxora.jewellery.occasion.repository.OccasionRepository;
import com.luxora.jewellery.product.service.ProductService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Resolves the homepage into a single, fully-composed payload.
 *
 * <p>{@code home_section_items} rows only store a loose
 * {@code (referenceType, referenceId)} pointer; this service is the one place
 * that turns each pointer into an actual summary DTO (category, subcategory,
 * collection, occasion or product) server-side, so the frontend can render
 * the entire homepage from a single {@code GET /api/v1/home/sections} call.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class HomeSectionService {

    private final HomeSectionRepository homeSectionRepository;
    private final HomeSectionItemRepository homeSectionItemRepository;
    private final HomeSectionMapper homeSectionMapper;

    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;
    private final SubCategoryRepository subCategoryRepository;
    private final CollectionRepository collectionRepository;
    private final CollectionMapper collectionMapper;
    private final OccasionRepository occasionRepository;
    private final OccasionMapper occasionMapper;
    private final ProductService productService;

    @Cacheable(value = "homeSections", key = "'all'")
    public List<HomeSectionDto> getHomeSections() {
        return homeSectionRepository.findByIsActiveTrueOrderByDisplayOrderAsc().stream()
                .map(this::toDto)
                .toList();
    }

    private HomeSectionDto toDto(HomeSection section) {
        List<HomeSectionItemDto> items = homeSectionItemRepository
                .findByHomeSection_IdOrderByDisplayOrderAsc(section.getId()).stream()
                .map(this::resolveItem)
                .filter(java.util.Objects::nonNull)
                .toList();
        return homeSectionMapper.toDto(section, items);
    }

    private HomeSectionItemDto resolveItem(HomeSectionItem item) {
        Object data = switch (item.getReferenceType()) {
            case CATEGORY -> categoryRepository.findById(item.getReferenceId())
                    .map(categoryMapper::toDto)
                    .orElse(null);
            case SUBCATEGORY -> subCategoryRepository.findById(item.getReferenceId())
                    .map(categoryMapper::toDto)
                    .orElse(null);
            case COLLECTION -> collectionRepository.findById(item.getReferenceId())
                    .map(collectionMapper::toDto)
                    .orElse(null);
            case OCCASION -> occasionRepository.findById(item.getReferenceId())
                    .map(occasionMapper::toDto)
                    .orElse(null);
            case PRODUCT -> {
                try {
                    yield productService.getProductSummaryById(item.getReferenceId());
                } catch (Exception ex) {
                    yield null;
                }
            }
        };

        if (data == null) {
            log.warn("home_section_items id={} references a missing/inactive {} id={}; skipping from response",
                    item.getId(), item.getReferenceType(), item.getReferenceId());
            return null;
        }

        return new HomeSectionItemDto(item.getId(), item.getReferenceType(), item.getReferenceId(),
                item.getDisplayOrder(), item.getOverrideImageUrl(), data);
    }
}
