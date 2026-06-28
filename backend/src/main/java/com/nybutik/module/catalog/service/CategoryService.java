package com.nybutik.module.catalog.service;

import com.nybutik.module.catalog.dto.request.CategoryRequest;
import com.nybutik.module.catalog.dto.response.CategoryResponse;
import com.nybutik.module.catalog.entity.Category;
import com.nybutik.module.catalog.mapper.CategoryMapper;
import com.nybutik.module.catalog.repository.CategoryRepository;
import com.nybutik.shared.exception.ConflictException;
import com.nybutik.shared.exception.ResourceNotFoundException;
import com.nybutik.shared.util.SlugUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;

    public List<CategoryResponse> getTree() {
        return categoryMapper.toResponseList(categoryRepository.findAllRootWithChildren());
    }

    public List<CategoryResponse> getRoots() {
        return categoryMapper.toResponseList(
                categoryRepository.findByParentIsNullAndIsActiveTrueOrderByDisplayOrderAsc());
    }

    public List<CategoryResponse> getChildren(Long parentId) {
        return categoryMapper.toResponseList(
                categoryRepository.findByParentIdAndIsActiveTrueOrderByDisplayOrderAsc(parentId));
    }

    public CategoryResponse getBySlug(String slug) {
        return categoryMapper.toResponse(findBySlug(slug));
    }

    public CategoryResponse getById(Long id) {
        return categoryMapper.toResponse(findById(id));
    }

    @Transactional
    public CategoryResponse create(CategoryRequest request) {
        String slug = SlugUtils.toSlug(request.name());
        if (categoryRepository.existsBySlug(slug)) {
            throw new ConflictException("Bu isimde kategori zaten mevcut");
        }

        Category category = Category.builder()
                .name(request.name())
                .slug(slug)
                .description(request.description())
                .imageUrl(request.imageUrl())
                .displayOrder(request.displayOrder() != null ? request.displayOrder() : 0)
                .isActive(request.isActive() != null ? request.isActive() : true)
                .build();

        if (request.parentId() != null) {
            category.setParent(findById(request.parentId()));
        }

        return categoryMapper.toResponse(categoryRepository.save(category));
    }

    @Transactional
    public CategoryResponse update(Long id, CategoryRequest request) {
        Category category = findById(id);

        String newSlug = SlugUtils.toSlug(request.name());
        if (!newSlug.equals(category.getSlug()) && categoryRepository.existsBySlug(newSlug)) {
            throw new ConflictException("Bu isimde kategori zaten mevcut");
        }

        category.setName(request.name());
        category.setSlug(newSlug);
        category.setDescription(request.description());
        category.setImageUrl(request.imageUrl());
        if (request.displayOrder() != null) category.setDisplayOrder(request.displayOrder());
        if (request.isActive() != null) category.setIsActive(request.isActive());

        if (request.parentId() != null) {
            category.setParent(findById(request.parentId()));
        } else {
            category.setParent(null);
        }

        return categoryMapper.toResponse(categoryRepository.save(category));
    }

    @Transactional
    public void delete(Long id) {
        Category category = findById(id);
        category.setIsActive(false);
        categoryRepository.save(category);
    }

    public Category findById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Kategori", id));
    }

    private Category findBySlug(String slug) {
        return categoryRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Kategori", slug));
    }
}
