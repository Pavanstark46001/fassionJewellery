package com.luxora.jewellery.admin.cms.service;

import com.luxora.jewellery.admin.cms.dto.AdminBannerRequest;
import com.luxora.jewellery.cms.dto.BannerDto;
import com.luxora.jewellery.cms.entity.Banner;
import com.luxora.jewellery.cms.mapper.BannerMapper;
import com.luxora.jewellery.cms.repository.BannerRepository;
import com.luxora.jewellery.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * Admin CRUD over {@code Banner}. Sprint 1-6 only ever seeded banners via SQL
 * (see {@code BannerService}, the public read side); this is the first
 * write path.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminBannerService {

    private final BannerRepository bannerRepository;
    private final BannerMapper bannerMapper;

    /** Admin listing includes inactive banners, unlike the public endpoint. */
    public List<BannerDto> listAll() {
        return bannerRepository.findAllByOrderByDisplayOrderAsc().stream().map(bannerMapper::toDto).toList();
    }

    public BannerDto get(UUID id) {
        return bannerMapper.toDto(findBanner(id));
    }

    @Transactional
    @CacheEvict(value = "homeBanners", allEntries = true)
    public BannerDto create(AdminBannerRequest request) {
        Banner banner = new Banner();
        apply(banner, request);
        return bannerMapper.toDto(bannerRepository.save(banner));
    }

    @Transactional
    @CacheEvict(value = "homeBanners", allEntries = true)
    public BannerDto update(UUID id, AdminBannerRequest request) {
        Banner banner = findBanner(id);
        apply(banner, request);
        return bannerMapper.toDto(bannerRepository.save(banner));
    }

    @Transactional
    @CacheEvict(value = "homeBanners", allEntries = true)
    public void delete(UUID id) {
        bannerRepository.delete(findBanner(id));
    }

    private Banner findBanner(UUID id) {
        return bannerRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Banner", "id", id));
    }

    private void apply(Banner banner, AdminBannerRequest request) {
        banner.setTitle(request.title());
        banner.setSubtitle(request.subtitle());
        banner.setImageUrl(request.imageUrl());
        banner.setLinkUrl(request.linkUrl());
        banner.setDisplayOrder(request.displayOrder() == null ? 0 : request.displayOrder());
        banner.setActive(request.isActive() == null || request.isActive());
    }
}
