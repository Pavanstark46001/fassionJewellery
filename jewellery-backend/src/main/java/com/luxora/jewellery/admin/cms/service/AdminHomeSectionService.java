package com.luxora.jewellery.admin.cms.service;

import com.luxora.jewellery.admin.cms.dto.AdminHomeSectionDto;
import com.luxora.jewellery.admin.cms.dto.AdminHomeSectionItemDto;
import com.luxora.jewellery.admin.cms.dto.AdminHomeSectionItemRequest;
import com.luxora.jewellery.admin.cms.dto.AdminHomeSectionRequest;
import com.luxora.jewellery.admin.cms.dto.AdminReorderRequest;
import com.luxora.jewellery.cms.entity.HomeSection;
import com.luxora.jewellery.cms.entity.HomeSectionItem;
import com.luxora.jewellery.cms.repository.HomeSectionItemRepository;
import com.luxora.jewellery.cms.repository.HomeSectionRepository;
import com.luxora.jewellery.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * Admin CRUD over {@code HomeSection}/{@code HomeSectionItem}.
 *
 * <p>Deliberately lean, matching the sprint scope: full CRUD on sections plus
 * add/update/remove of individual items and a simple ordering endpoint. A
 * drag-and-drop visual homepage builder is explicitly out of scope - this is
 * just the API surface an admin UI's list/forms would call.
 *
 * <p>Item DTOs here are the raw {@code (referenceType, referenceId)} pointer,
 * not the resolved category/product/etc payload - that resolution only
 * happens on the public read side ({@code HomeSectionService}), the same
 * separation {@code HomeSectionItem} itself already encodes.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminHomeSectionService {

    private final HomeSectionRepository homeSectionRepository;
    private final HomeSectionItemRepository homeSectionItemRepository;

    public List<AdminHomeSectionDto> listAll() {
        return homeSectionRepository.findAllByOrderByDisplayOrderAsc().stream().map(this::toDto).toList();
    }

    public AdminHomeSectionDto get(UUID id) {
        return toDto(findSection(id));
    }

    @Transactional
    @CacheEvict(value = "homeSections", allEntries = true)
    public AdminHomeSectionDto create(AdminHomeSectionRequest request) {
        HomeSection section = new HomeSection();
        apply(section, request);
        return toDto(homeSectionRepository.save(section));
    }

    @Transactional
    @CacheEvict(value = "homeSections", allEntries = true)
    public AdminHomeSectionDto update(UUID id, AdminHomeSectionRequest request) {
        HomeSection section = findSection(id);
        apply(section, request);
        return toDto(homeSectionRepository.save(section));
    }

    @Transactional
    @CacheEvict(value = "homeSections", allEntries = true)
    public AdminHomeSectionDto reorder(UUID id, AdminReorderRequest request) {
        HomeSection section = findSection(id);
        section.setDisplayOrder(request.displayOrder());
        return toDto(homeSectionRepository.save(section));
    }

    @Transactional
    @CacheEvict(value = "homeSections", allEntries = true)
    public void delete(UUID id) {
        homeSectionRepository.delete(findSection(id));
    }

    public List<AdminHomeSectionItemDto> listItems(UUID sectionId) {
        findSection(sectionId);
        return homeSectionItemRepository.findByHomeSection_IdOrderByDisplayOrderAsc(sectionId).stream()
                .map(this::toItemDto)
                .toList();
    }

    @Transactional
    @CacheEvict(value = "homeSections", allEntries = true)
    public AdminHomeSectionItemDto addItem(UUID sectionId, AdminHomeSectionItemRequest request) {
        HomeSection section = findSection(sectionId);
        HomeSectionItem item = new HomeSectionItem();
        item.setHomeSection(section);
        applyItem(item, request);
        return toItemDto(homeSectionItemRepository.save(item));
    }

    @Transactional
    @CacheEvict(value = "homeSections", allEntries = true)
    public AdminHomeSectionItemDto updateItem(UUID sectionId, UUID itemId, AdminHomeSectionItemRequest request) {
        HomeSectionItem item = findOwnedItem(sectionId, itemId);
        applyItem(item, request);
        return toItemDto(homeSectionItemRepository.save(item));
    }

    @Transactional
    @CacheEvict(value = "homeSections", allEntries = true)
    public void deleteItem(UUID sectionId, UUID itemId) {
        homeSectionItemRepository.delete(findOwnedItem(sectionId, itemId));
    }

    private HomeSection findSection(UUID id) {
        return homeSectionRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("HomeSection", "id", id));
    }

    private HomeSectionItem findOwnedItem(UUID sectionId, UUID itemId) {
        HomeSectionItem item = homeSectionItemRepository.findById(itemId)
                .orElseThrow(() -> ResourceNotFoundException.of("HomeSectionItem", "id", itemId));
        if (!item.getHomeSection().getId().equals(sectionId)) {
            throw ResourceNotFoundException.of("HomeSectionItem", "id", itemId);
        }
        return item;
    }

    private void apply(HomeSection section, AdminHomeSectionRequest request) {
        section.setTitle(request.title());
        section.setSubtitle(request.subtitle());
        section.setSectionType(request.sectionType());
        section.setDisplayOrder(request.displayOrder() == null ? 0 : request.displayOrder());
        section.setActive(request.isActive() == null || request.isActive());
    }

    private void applyItem(HomeSectionItem item, AdminHomeSectionItemRequest request) {
        item.setReferenceType(request.referenceType());
        item.setReferenceId(request.referenceId());
        item.setDisplayOrder(request.displayOrder() == null ? 0 : request.displayOrder());
        item.setOverrideImageUrl(request.overrideImageUrl());
    }

    private AdminHomeSectionDto toDto(HomeSection section) {
        List<AdminHomeSectionItemDto> items = homeSectionItemRepository
                .findByHomeSection_IdOrderByDisplayOrderAsc(section.getId()).stream()
                .map(this::toItemDto)
                .toList();
        return new AdminHomeSectionDto(section.getId(), section.getTitle(), section.getSubtitle(),
                section.getSectionType(), section.getDisplayOrder(), section.isActive(), items);
    }

    private AdminHomeSectionItemDto toItemDto(HomeSectionItem item) {
        return new AdminHomeSectionItemDto(item.getId(), item.getHomeSection().getId(), item.getReferenceType(),
                item.getReferenceId(), item.getDisplayOrder(), item.getOverrideImageUrl());
    }
}
