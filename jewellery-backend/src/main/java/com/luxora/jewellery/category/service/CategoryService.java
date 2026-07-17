package com.luxora.jewellery.category.service;

import com.luxora.jewellery.category.dto.CategoryDto;
import com.luxora.jewellery.category.dto.SubCategoryDto;
import com.luxora.jewellery.category.entity.Category;
import com.luxora.jewellery.category.mapper.CategoryMapper;
import com.luxora.jewellery.category.repository.CategoryRepository;
import com.luxora.jewellery.category.repository.SubCategoryRepository;
import com.luxora.jewellery.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final SubCategoryRepository subCategoryRepository;
    private final CategoryMapper categoryMapper;

    @Cacheable(value = "categories", key = "#activeOnly")
    public List<CategoryDto> getCategories(boolean activeOnly) {
        List<Category> categories = activeOnly
                ? categoryRepository.findByIsActiveTrueOrderByDisplayOrderAsc()
                : categoryRepository.findAllByOrderByDisplayOrderAsc();
        return categories.stream().map(categoryMapper::toDto).toList();
    }

    @Cacheable(value = "categories", key = "#slug")
    public CategoryDto getCategoryBySlug(String slug) {
        Category category = categoryRepository.findBySlug(slug)
                .orElseThrow(() -> ResourceNotFoundException.of("Category", "slug", slug));
        return categoryMapper.toDto(category);
    }

    @Cacheable(value = "subcategories", key = "#slug")
    public List<SubCategoryDto> getSubCategoriesByCategorySlug(String slug) {
        Category category = categoryRepository.findBySlug(slug)
                .orElseThrow(() -> ResourceNotFoundException.of("Category", "slug", slug));
        return subCategoryRepository.findByCategory_IdAndIsActiveTrueOrderByDisplayOrderAsc(category.getId())
                .stream()
                .map(categoryMapper::toDto)
                .toList();
    }
}
