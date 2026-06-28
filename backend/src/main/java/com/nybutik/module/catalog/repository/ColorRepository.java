package com.nybutik.module.catalog.repository;

import com.nybutik.module.catalog.entity.Color;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ColorRepository extends JpaRepository<Color, Long> {
    List<Color> findAllByOrderByNameAsc();
}
