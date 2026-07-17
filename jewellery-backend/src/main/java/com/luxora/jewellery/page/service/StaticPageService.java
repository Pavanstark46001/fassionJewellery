package com.luxora.jewellery.page.service;

import com.luxora.jewellery.common.exception.ResourceNotFoundException;
import com.luxora.jewellery.page.dto.StaticPageDto;
import com.luxora.jewellery.page.mapper.StaticPageMapper;
import com.luxora.jewellery.page.repository.StaticPageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StaticPageService {

    private final StaticPageRepository staticPageRepository;
    private final StaticPageMapper staticPageMapper;

    public StaticPageDto getBySlug(String slug) {
        return staticPageRepository.findBySlug(slug)
                .map(staticPageMapper::toDto)
                .orElseThrow(() -> ResourceNotFoundException.of("StaticPage", "slug", slug));
    }
}
