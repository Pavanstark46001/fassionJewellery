package com.luxora.jewellery.blog.mapper;

import com.luxora.jewellery.blog.dto.BlogPostDto;
import com.luxora.jewellery.blog.dto.BlogPostSummaryDto;
import com.luxora.jewellery.blog.entity.BlogPost;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface BlogPostMapper {

    BlogPostSummaryDto toSummaryDto(BlogPost blogPost);

    @Mapping(target = "isPublished", source = "published")
    BlogPostDto toDto(BlogPost blogPost);
}
