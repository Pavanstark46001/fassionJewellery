package com.luxora.jewellery.admin.blog.service;

import com.luxora.jewellery.admin.blog.dto.AdminBlogPostRequest;
import com.luxora.jewellery.blog.dto.BlogPostDto;
import com.luxora.jewellery.blog.entity.BlogPost;
import com.luxora.jewellery.blog.mapper.BlogPostMapper;
import com.luxora.jewellery.blog.repository.BlogPostRepository;
import com.luxora.jewellery.common.exception.ResourceNotFoundException;
import com.luxora.jewellery.common.util.UniqueSlugResolver;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Admin CRUD over {@code BlogPost}. Listing includes drafts (unpublished
 * posts); the public {@code BlogPostService} only ever sees published ones.
 *
 * <p>{@code publishedDate} is stamped automatically the first time a post's
 * {@code isPublished} flips to {@code true} (create or update) and is never
 * overwritten afterwards - it's meant to read as "first went live", not
 * "last saved while published".
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminBlogPostService {

    private final BlogPostRepository blogPostRepository;
    private final BlogPostMapper blogPostMapper;

    public List<BlogPostDto> listAll() {
        return blogPostRepository.findAllByOrderByCreatedDateDesc().stream()
                .map(blogPostMapper::toDto)
                .toList();
    }

    public BlogPostDto get(UUID id) {
        return blogPostMapper.toDto(findPost(id));
    }

    @Transactional
    public BlogPostDto create(AdminBlogPostRequest request) {
        BlogPost post = new BlogPost();
        apply(post, request);
        return blogPostMapper.toDto(blogPostRepository.save(post));
    }

    @Transactional
    public BlogPostDto update(UUID id, AdminBlogPostRequest request) {
        BlogPost post = findPost(id);
        apply(post, request);
        return blogPostMapper.toDto(blogPostRepository.save(post));
    }

    @Transactional
    public void delete(UUID id) {
        blogPostRepository.delete(findPost(id));
    }

    private BlogPost findPost(UUID id) {
        return blogPostRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("BlogPost", "id", id));
    }

    private void apply(BlogPost post, AdminBlogPostRequest request) {
        post.setTitle(request.title());
        post.setSlug(UniqueSlugResolver.resolve(request.slug(), request.title(), post.getId(),
                blogPostRepository::findBySlug));
        post.setExcerpt(request.excerpt());
        post.setContent(request.content());
        post.setCoverImageUrl(request.coverImageUrl());
        post.setAuthorName(request.authorName());
        post.setMetaTitle(request.metaTitle());
        post.setMetaDescription(request.metaDescription());

        boolean nowPublished = Boolean.TRUE.equals(request.isPublished());
        if (nowPublished && !post.isPublished() && post.getPublishedDate() == null) {
            post.setPublishedDate(Instant.now());
        }
        post.setPublished(nowPublished);
    }
}
