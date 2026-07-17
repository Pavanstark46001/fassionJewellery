package com.luxora.jewellery.occasion.service;

import com.luxora.jewellery.common.dto.PageResponse;
import com.luxora.jewellery.common.exception.ResourceNotFoundException;
import com.luxora.jewellery.occasion.dto.OccasionDto;
import com.luxora.jewellery.occasion.mapper.OccasionMapper;
import com.luxora.jewellery.occasion.repository.OccasionRepository;
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
public class OccasionService {

    private final OccasionRepository occasionRepository;
    private final OccasionMapper occasionMapper;
    private final ProductService productService;

    @Cacheable(value = "occasions", key = "'all'")
    public List<OccasionDto> getOccasions() {
        return occasionRepository.findByIsActiveTrueOrderByDisplayOrderAsc().stream()
                .map(occasionMapper::toDto)
                .toList();
    }

    @Cacheable(value = "occasions", key = "#slug")
    public OccasionDto getOccasionBySlug(String slug) {
        return occasionMapper.toDto(occasionRepository.findBySlug(slug)
                .orElseThrow(() -> ResourceNotFoundException.of("Occasion", "slug", slug)));
    }

    public PageResponse<ProductSummaryDto> getProductsByOccasionSlug(String slug, Pageable pageable) {
        occasionRepository.findBySlug(slug)
                .orElseThrow(() -> ResourceNotFoundException.of("Occasion", "slug", slug));
        return productService.getProductsByOccasionSlug(slug, pageable);
    }
}
