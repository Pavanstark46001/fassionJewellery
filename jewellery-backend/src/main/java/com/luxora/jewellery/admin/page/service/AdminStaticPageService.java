package com.luxora.jewellery.admin.page.service;

import com.luxora.jewellery.admin.page.dto.AdminStaticPageRequest;
import com.luxora.jewellery.common.exception.ResourceNotFoundException;
import com.luxora.jewellery.common.util.UniqueSlugResolver;
import com.luxora.jewellery.page.dto.StaticPageDto;
import com.luxora.jewellery.page.entity.StaticPage;
import com.luxora.jewellery.page.mapper.StaticPageMapper;
import com.luxora.jewellery.page.repository.StaticPageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminStaticPageService {

    private final StaticPageRepository staticPageRepository;
    private final StaticPageMapper staticPageMapper;

    public List<StaticPageDto> listAll() {
        return staticPageRepository.findAllByOrderByTitleAsc().stream().map(staticPageMapper::toDto).toList();
    }

    public StaticPageDto get(UUID id) {
        return staticPageMapper.toDto(findPage(id));
    }

    @Transactional
    public StaticPageDto create(AdminStaticPageRequest request) {
        StaticPage page = new StaticPage();
        apply(page, request);
        return staticPageMapper.toDto(staticPageRepository.save(page));
    }

    @Transactional
    public StaticPageDto update(UUID id, AdminStaticPageRequest request) {
        StaticPage page = findPage(id);
        apply(page, request);
        return staticPageMapper.toDto(staticPageRepository.save(page));
    }

    @Transactional
    public void delete(UUID id) {
        staticPageRepository.delete(findPage(id));
    }

    private StaticPage findPage(UUID id) {
        return staticPageRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("StaticPage", "id", id));
    }

    private void apply(StaticPage page, AdminStaticPageRequest request) {
        page.setTitle(request.title());
        page.setSlug(UniqueSlugResolver.resolve(request.slug(), request.title(), page.getId(),
                staticPageRepository::findBySlug));
        page.setContent(request.content());
        page.setMetaTitle(request.metaTitle());
        page.setMetaDescription(request.metaDescription());
    }
}
