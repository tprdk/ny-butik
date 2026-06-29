package com.nybutik.module.catalog.repository;

import com.nybutik.module.catalog.entity.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProductVariantRepository extends JpaRepository<ProductVariant, Long> {

    @Query("SELECT v FROM ProductVariant v JOIN FETCH v.product p LEFT JOIN FETCH p.images LEFT JOIN FETCH v.color LEFT JOIN FETCH v.size WHERE v.id = :id")
    Optional<ProductVariant> findByIdWithDetails(@Param("id") Long id);
}
