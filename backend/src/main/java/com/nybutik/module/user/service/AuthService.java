package com.nybutik.module.user.service;

import com.nybutik.module.user.dto.request.LoginRequest;
import com.nybutik.module.user.dto.request.RegisterRequest;
import com.nybutik.module.user.dto.response.AuthResponse;
import com.nybutik.module.user.entity.RefreshToken;
import com.nybutik.module.user.entity.User;
import com.nybutik.module.user.enums.Role;
import com.nybutik.module.user.mapper.UserMapper;
import com.nybutik.module.user.repository.RefreshTokenRepository;
import com.nybutik.module.user.repository.UserRepository;
import com.nybutik.shared.exception.BusinessException;
import com.nybutik.shared.exception.ConflictException;
import com.nybutik.shared.security.JwtService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.util.WebUtils;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.Arrays;
import java.util.Base64;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private static final String REFRESH_COOKIE = "refresh_token";

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final UserMapper userMapper;

    @Value("${app.jwt.access-token-expiry}")
    private long accessTokenExpiry;

    @Value("${app.jwt.refresh-token-expiry}")
    private long refreshTokenExpiry;

    @Transactional
    public AuthResponse register(RegisterRequest request, HttpServletResponse response) {
        if (userRepository.existsByEmail(request.email())) {
            throw new ConflictException("Bu e-posta adresi zaten kayıtlı.");
        }

        User user = User.builder()
                .email(request.email().toLowerCase().strip())
                .passwordHash(passwordEncoder.encode(request.password()))
                .firstName(request.firstName().strip())
                .lastName(request.lastName().strip())
                .role(Role.CUSTOMER)
                .emailVerified(false)
                .isActive(true)
                .build();

        user = userRepository.save(user);
        log.info("New user registered: id={}", user.getId());

        return issueTokenPair(user, response);
    }

    @Transactional
    public AuthResponse login(LoginRequest request, HttpServletResponse response) {
        User user = userRepository.findByEmail(request.email().toLowerCase().strip())
                .orElseThrow(() -> new BusinessException("E-posta veya şifre hatalı.", HttpStatus.UNAUTHORIZED));

        if (!user.isActive()) {
            throw new BusinessException("Hesabınız askıya alınmıştır.", HttpStatus.FORBIDDEN);
        }

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new BusinessException("E-posta veya şifre hatalı.", HttpStatus.UNAUTHORIZED);
        }

        log.info("User logged in: id={}", user.getId());
        return issueTokenPair(user, response);
    }

    @Transactional
    public AuthResponse refresh(HttpServletRequest request, HttpServletResponse response) {
        Cookie cookie = WebUtils.getCookie(request, REFRESH_COOKIE);
        if (cookie == null) {
            throw new BusinessException("Refresh token bulunamadı.", HttpStatus.UNAUTHORIZED);
        }

        String rawToken = cookie.getValue();
        String tokenHash = hash(rawToken);

        RefreshToken refreshToken = refreshTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new BusinessException("Geçersiz token.", HttpStatus.UNAUTHORIZED));

        if (!refreshToken.isValid()) {
            // Şüpheli durum: geçersiz token kullanım girişimi → tüm session'ları kapat
            if (refreshToken.isRevoked()) {
                log.warn("Revoked refresh token reuse detected for user id={}", refreshToken.getUser().getId());
                refreshTokenRepository.revokeAllByUserId(refreshToken.getUser().getId());
            }
            clearRefreshCookie(response);
            throw new BusinessException("Token süresi dolmuş. Lütfen tekrar giriş yapın.", HttpStatus.UNAUTHORIZED);
        }

        // Rotation: eskiyi iptal et, yeni çift üret
        refreshToken.setRevoked(true);
        refreshTokenRepository.save(refreshToken);

        return issueTokenPair(refreshToken.getUser(), response);
    }

    @Transactional
    public void logout(HttpServletRequest request, HttpServletResponse response) {
        Cookie cookie = WebUtils.getCookie(request, REFRESH_COOKIE);
        if (cookie != null) {
            String tokenHash = hash(cookie.getValue());
            refreshTokenRepository.findByTokenHash(tokenHash)
                    .ifPresent(t -> {
                        t.setRevoked(true);
                        refreshTokenRepository.save(t);
                    });
        }
        clearRefreshCookie(response);
    }

    // Her gece 03:00'da süresi dolmuş ve iptal edilmiş token'ları temizle
    @Scheduled(cron = "0 0 3 * * *")
    @Transactional
    public void cleanupExpiredTokens() {
        refreshTokenRepository.deleteExpiredAndRevoked(Instant.now());
        log.info("Expired/revoked refresh tokens cleaned up");
    }

    private AuthResponse issueTokenPair(User user, HttpServletResponse response) {
        String accessToken = jwtService.generateAccessToken(
                user.getId(), user.getEmail(), user.getRole().name());

        String rawRefreshToken = UUID.randomUUID().toString();
        String tokenHash = hash(rawRefreshToken);

        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .tokenHash(tokenHash)
                .expiresAt(Instant.now().plusSeconds(refreshTokenExpiry))
                .revoked(false)
                .build();

        refreshTokenRepository.save(refreshToken);
        setRefreshCookie(response, rawRefreshToken);

        return new AuthResponse(accessToken, accessTokenExpiry, userMapper.toUserResponse(user));
    }

    private void setRefreshCookie(HttpServletResponse response, String token) {
        String cookieValue = REFRESH_COOKIE + "=" + token
                + "; Path=/api/v1/auth/refresh"
                + "; HttpOnly"
                + "; SameSite=Strict"
                + "; Max-Age=" + refreshTokenExpiry;
        response.addHeader("Set-Cookie", cookieValue);
    }

    private void clearRefreshCookie(HttpServletResponse response) {
        String cookieValue = REFRESH_COOKIE + "="
                + "; Path=/api/v1/auth/refresh"
                + "; HttpOnly"
                + "; SameSite=Strict"
                + "; Max-Age=0";
        response.addHeader("Set-Cookie", cookieValue);
    }

    private String hash(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] bytes = digest.digest(value.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(bytes);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 not available", e);
        }
    }
}
