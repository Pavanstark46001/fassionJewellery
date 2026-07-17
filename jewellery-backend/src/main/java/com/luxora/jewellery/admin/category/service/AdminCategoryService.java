package com.luxora.jewellery.admin.category.service;

import com.luxora.jewellery.admin.category.dto.AdminCategoryRequest;
import com.luxora.jewellery.admin.category.dto.AdminSubCategoryRequest;
import com.luxora.jewellery.category.dto.CategoryDto;
import com.luxora.jewellery.category.dto.SubCategoryDto;
import com.luxora.jewellery.category.entity.Category;
import com.luxora.jewellery.category.entity.SubCategory;
import com.luxora.jewellery.category.mapper.CategoryMapper;
import com.luxora.jewellery.category.repository.CategoryRepository;
import com.luxora.jewellery.category.repository.SubCategoryRepository;
import com.luxora.jewellery.common.exception.ResourceNotFoundException;
import com.luxora.jewellery.common.util.UniqueSlugResolver;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * Admin CRUD over {@code Category}/{@code SubCategory}, deliberately lean -
 * these are simple lookup-table-shaped entities compared to {@code Product}.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminCategoryService {

    private final CategoryRepository categoryRepository;
    private final SubCategoryRepository subCategoryRepository;
    private final CategoryMapper categoryMapper;

    public List<CategoryDto> listAll() {
        return categoryRepository.findAllByOrderByDisplayOrderAsc().stream().map(categoryMapper::toDto).toList();
    }

    public CategoryDto get(UUID id) {
        return categoryMapper.toDto(findCategory(id));
    }

    @Transactional
    @CacheEvict(value = "categories", allEntries = true)
    public CategoryDto create(AdminCategoryRequest request) {
        Category category = new Category();
        apply(category, request);
        return categoryMapper.toDto(categoryRepository.save(category));
    }

    @Transactional
    @CacheEvict(value = "categories", allEntries = true)
    public CategoryDto update(UUID id, AdminCategoryRequest request) {
        Category category = findCategory(id);
        apply(category, request);
        return categoryMapper.toDto(categoryRepository.save(category));
    }

    @Transactional
    @CacheEvict(value = "categories", allEntries = true)
    public void delete(UUID id) {
        categoryRepository.delete(findCategory(id));
    }

    public List<SubCategoryDto> listSubCategories(UUID categoryId) {
        findCategory(categoryId);
        return subCategoryRepository.findByCategory_IdOrderByDisplayOrderAsc(categoryId).stream()
                .map(categoryMapper::toDto)
                .toList();
    }

    public SubCategoryDto getSubCategory(UUID categoryId, UUID subCategoryId) {
        return categoryMapper.toDto(findOwnedSubCategory(categoryId, subCategoryId));
    }

    @Transactional
    @CacheEvict(value = {"categories", "subcategories"}, allEntries = true)
    public SubCategoryDto createSubCategory(UUID categoryId, AdminSubCategoryRequest request) {
        Category category = findCategory(categoryId);
        SubCategory subCategory = new SubCategory();
        subCategory.setCategory(category);
        apply(subCategory, request);
        return categoryMapper.toDto(subCategoryRepository.save(subCategory));
    }

    @Transactional
    @CacheEvict(value = {"categories", "subcategories"}, allEntries = true)
    public SubCategoryDto updateSubCategory(UUID categoryId, UUID subCategoryId, AdminSubCategoryRequest request) {
        SubCategory subCategory = findOwnedSubCategory(categoryId, subCategoryId);
        apply(subCategory, request);
        return categoryMapper.toDto(subCategoryRepository.save(subCategory));
    }

    @Transactional
    @CacheEvict(value = {"categories", "subcategories"}, allEntries = true)
    public void deleteSubCategory(UUID categoryId, UUID subCategoryId) {
        subCategoryRepository.delete(findOwnedSubCategory(categoryId, subCategoryId));
    }

    private Category findCategory(UUID id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Category", "id", id));
    }

    private SubCategory findOwnedSubCategory(UUID categoryId, UUID subCategoryId) {
        SubCategory subCategory = subCategoryRepository.findById(subCategoryId)
                .orElseThrow(() -> ResourceNotFoundException.of("SubCategory", "id", subCategoryId));
        if (!subCategory.getCategory().getId().equals(categoryId)) {
            throw ResourceNotFoundException.of("SubCategory", "id", subCategoryId);
        }
        return subCategory;
    }

    private void apply(Category category, AdminCategoryRequest request) {
        category.setName(request.name());
        category.setSlug(UniqueSlugResolver.resolve(request.slug(), request.name(), category.getId(),
                categoryRepository::findBySlug));
        category.setDescription(request.description());
        category.setImageUrl(request.imageUrl());
        category.setDisplayOrder(request.displayOrder() == null ? 0 : request.displayOrder());
        category.setActive(request.isActive() == null || request.isActive());
        category.setMetaTitle(request.metaTitle());
        category.setMetaDescription(request.metaDescription());
    }

    private void apply(SubCategory subCategory, AdminSubCategoryRequest request) {
        subCategory.setName(request.name());
        subCategory.setSlug(UniqueSlugResolver.resolve(request.slug(), request.name(), subCategory.getId(),
                subCategoryRepository::findBySlug));
        subCategory.setDescription(request.description());
        subCategory.setImageUrl(request.imageUrl());
        subCategory.setDisplayOrder(request.displayOrder() == null ? 0 : request.displayOrder());
        subCategory.setActive(request.isActive() == null || request.isActive());
    }
}
