package com.nybutik.module.catalog.repository;

import com.nybutik.module.catalog.entity.Size;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SizeRepository extends JpaRepository<Size, Long> {
    List<Size> findAllByOrderBySortOrderAsc();
    List<Size> findBySizeGroupOrderBySortOrderAsc(String sizeGroup);
}
