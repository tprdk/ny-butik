package com.nybutik.module.catalog.repository;

import com.nybutik.module.catalog.entity.Product;
import com.nybutik.module.catalog.enums.ProductStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {

    Optional<Product> findBySlugAndDeletedAtIsNull(String slug);

    Optional<Product> findByIdAndDeletedAtIsNull(Long id);

    @Query("SELECT p FROM Product p WHERE p.featured = true AND p.status = :status AND p.deletedAt IS NULL ORDER BY p.updatedAt DESC")
    Page<Product> findFeatured(ProductStatus status, Pageable pageable);

    boolean existsBySlug(String slug);
}
