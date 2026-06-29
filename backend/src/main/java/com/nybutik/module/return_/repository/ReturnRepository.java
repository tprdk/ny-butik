package com.nybutik.module.return_.repository;

import com.nybutik.module.return_.entity.Return;
import com.nybutik.module.return_.enums.ReturnStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ReturnRepository extends JpaRepository<Return, Long> {

    Page<Return> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    Page<Return> findByStatusOrderByCreatedAtDesc(ReturnStatus status, Pageable pageable);

    Page<Return> findAllByOrderByCreatedAtDesc(Pageable pageable);

    @Query("SELECT r FROM Return r LEFT JOIN FETCH r.items WHERE r.id = :id")
    Optional<Return> findByIdWithItems(@Param("id") Long id);
}
