package com.luxora.jewellery.blog.service;

import com.luxora.jewellery.blog.dto.BlogPostDto;
import com.luxora.jewellery.blog.dto.BlogPostSummaryDto;
import com.luxora.jewellery.blog.entity.BlogPost;
import com.luxora.jewellery.blog.mapper.BlogPostMapper;
import com.luxora.jewellery.blog.repository.BlogPostRepository;
import com.luxora.jewellery.common.dto.PageResponse;
import com.luxora.jewellery.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Public read side of the blog: published posts only, newest first.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BlogPostService {

    private final BlogPostRepository blogPostRepository;
    private final BlogPostMapper blogPostMapper;

    public PageResponse<BlogPostSummaryDto> listPublished(Pageable pageable) {
        Page<BlogPost> page = blogPostRepository.findByIsPublishedTrueOrderByPublishedDateDesc(pageable);
        return PageResponse.from(page, page.getContent().stream().map(blogPostMapper::toSummaryDto).toList());
    }

    public BlogPostDto getPublishedBySlug(String slug) {
        BlogPost post = blogPostRepository.findBySlugAndIsPublishedTrue(slug)
                .orElseThrow(() -> ResourceNotFoundException.of("BlogPost", "slug", slug));
        return blogPostMapper.toDto(post);
    }
}
