package com.luxora.jewellery.admin.collection.service;

import com.luxora.jewellery.admin.collection.dto.AdminCollectionRequest;
import com.luxora.jewellery.collection.dto.CollectionDto;
import com.luxora.jewellery.collection.entity.Collection;
import com.luxora.jewellery.collection.mapper.CollectionMapper;
import com.luxora.jewellery.collection.repository.CollectionRepository;
import com.luxora.jewellery.common.exception.ResourceNotFoundException;
import com.luxora.jewellery.common.util.UniqueSlugResolver;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminCollectionService {

    private final CollectionRepository collectionRepository;
    private final CollectionMapper collectionMapper;

    public List<CollectionDto> listAll() {
        return collectionRepository.findAllByOrderByDisplayOrderAsc().stream()
                .map(collectionMapper::toDto)
                .toList();
    }

    public CollectionDto get(UUID id) {
        return collectionMapper.toDto(findCollection(id));
    }

    @Transactional
    @CacheEvict(value = "collections", allEntries = true)
    public CollectionDto create(AdminCollectionRequest request) {
        Collection collection = new Collection();
        apply(collection, request);
        return collectionMapper.toDto(collectionRepository.save(collection));
    }

    @Transactional
    @CacheEvict(value = "collections", allEntries = true)
    public CollectionDto update(UUID id, AdminCollectionRequest request) {
        Collection collection = findCollection(id);
        apply(collection, request);
        return collectionMapper.toDto(collectionRepository.save(collection));
    }

    @Transactional
    @CacheEvict(value = "collections", allEntries = true)
    public void delete(UUID id) {
        collectionRepository.delete(findCollection(id));
    }

    private Collection findCollection(UUID id) {
        return collectionRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Collection", "id", id));
    }

    private void apply(Collection collection, AdminCollectionRequest request) {
        collection.setName(request.name());
        collection.setSlug(UniqueSlugResolver.resolve(request.slug(), request.name(), collection.getId(),
                collectionRepository::findBySlug));
        collection.setDescription(request.description());
        collection.setImageUrl(request.imageUrl());
        collection.setFeatured(Boolean.TRUE.equals(request.isFeatured()));
        collection.setDisplayOrder(request.displayOrder() == null ? 0 : request.displayOrder());
        collection.setActive(request.isActive() == null || request.isActive());
        collection.setMetaTitle(request.metaTitle());
        collection.setMetaDescription(request.metaDescription());
    }
}
