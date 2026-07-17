package com.luxora.jewellery.admin.occasion.service;

import com.luxora.jewellery.admin.occasion.dto.AdminOccasionRequest;
import com.luxora.jewellery.common.exception.ResourceNotFoundException;
import com.luxora.jewellery.common.util.UniqueSlugResolver;
import com.luxora.jewellery.occasion.dto.OccasionDto;
import com.luxora.jewellery.occasion.entity.Occasion;
import com.luxora.jewellery.occasion.mapper.OccasionMapper;
import com.luxora.jewellery.occasion.repository.OccasionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminOccasionService {

    private final OccasionRepository occasionRepository;
    private final OccasionMapper occasionMapper;

    public List<OccasionDto> listAll() {
        return occasionRepository.findAllByOrderByDisplayOrderAsc().stream()
                .map(occasionMapper::toDto)
                .toList();
    }

    public OccasionDto get(UUID id) {
        return occasionMapper.toDto(findOccasion(id));
    }

    @Transactional
    @CacheEvict(value = "occasions", allEntries = true)
    public OccasionDto create(AdminOccasionRequest request) {
        Occasion occasion = new Occasion();
        apply(occasion, request);
        return occasionMapper.toDto(occasionRepository.save(occasion));
    }

    @Transactional
    @CacheEvict(value = "occasions", allEntries = true)
    public OccasionDto update(UUID id, AdminOccasionRequest request) {
        Occasion occasion = findOccasion(id);
        apply(occasion, request);
        return occasionMapper.toDto(occasionRepository.save(occasion));
    }

    @Transactional
    @CacheEvict(value = "occasions", allEntries = true)
    public void delete(UUID id) {
        occasionRepository.delete(findOccasion(id));
    }

    private Occasion findOccasion(UUID id) {
        return occasionRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Occasion", "id", id));
    }

    private void apply(Occasion occasion, AdminOccasionRequest request) {
        occasion.setName(request.name());
        occasion.setSlug(UniqueSlugResolver.resolve(request.slug(), request.name(), occasion.getId(),
                occasionRepository::findBySlug));
        occasion.setDescription(request.description());
        occasion.setImageUrl(request.imageUrl());
        occasion.setDisplayOrder(request.displayOrder() == null ? 0 : request.displayOrder());
        occasion.setActive(request.isActive() == null || request.isActive());
        occasion.setMetaTitle(request.metaTitle());
        occasion.setMetaDescription(request.metaDescription());
    }
}
