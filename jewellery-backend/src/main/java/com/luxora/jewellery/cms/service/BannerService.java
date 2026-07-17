package com.luxora.jewellery.cms.service;

import com.luxora.jewellery.cms.dto.BannerDto;
import com.luxora.jewellery.cms.mapper.BannerMapper;
import com.luxora.jewellery.cms.repository.BannerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BannerService {

    private final BannerRepository bannerRepository;
    private final BannerMapper bannerMapper;

    @Cacheable(value = "homeBanners", key = "#activeOnly")
    public List<BannerDto> getBanners(boolean activeOnly) {
        var banners = activeOnly
                ? bannerRepository.findByIsActiveTrueOrderByDisplayOrderAsc()
                : bannerRepository.findAllByOrderByDisplayOrderAsc();
        return banners.stream().map(bannerMapper::toDto).toList();
    }
}
