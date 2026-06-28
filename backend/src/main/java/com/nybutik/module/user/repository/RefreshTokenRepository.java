package com.nybutik.module.user.repository;

import com.nybutik.module.user.entity.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.time.Instant;
import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    Optional<RefreshToken> findByTokenHash(String tokenHash);

    @Modifying
    @Query("UPDATE RefreshToken r SET r.revoked = true WHERE r.user.id = :userId AND r.revoked = false")
    void revokeAllByUserId(Long userId);

    @Modifying
    @Query("DELETE FROM RefreshToken r WHERE r.expiresAt < :cutoff OR r.revoked = true")
    void deleteExpiredAndRevoked(Instant cutoff);
}
