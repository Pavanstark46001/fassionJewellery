package com.luxora.jewellery.category.mapper;

import com.luxora.jewellery.category.dto.CategoryDto;
import com.luxora.jewellery.category.dto.SubCategoryDto;
import com.luxora.jewellery.category.entity.Category;
import com.luxora.jewellery.category.entity.SubCategory;
import org.mapstruct.Mapping;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CategoryMapper {

    @Mapping(target = "isActive", source = "active")
    CategoryDto toDto(Category category);

    @Mapping(target = "categoryId", source = "category.id")
    @Mapping(target = "categoryName", source = "category.name")
    @Mapping(target = "isActive", source = "active")
    SubCategoryDto toDto(SubCategory subCategory);
}
