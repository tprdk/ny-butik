package com.nybutik.shared.security;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.slf4j.MDC;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        String traceId = UUID.randomUUID().toString().substring(0, 8);
        MDC.put("traceId", traceId);
        response.setHeader("X-Trace-Id", traceId);

        try {
            String token = extractToken(request);
            if (StringUtils.hasText(token)) {
                jwtService.validateAndParseClaims(token).ifPresent(claims -> {
                    UserPrincipal principal = buildPrincipal(claims);
                    UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                            principal, null,
                            List.of(new SimpleGrantedAuthority("ROLE_" + claims.get("role", String.class)))
                    );
                    SecurityContextHolder.getContext().setAuthentication(auth);
                });
            }
            filterChain.doFilter(request, response);
        } finally {
            MDC.clear();
        }
    }

    private String extractToken(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (StringUtils.hasText(header) && header.startsWith("Bearer ")) {
            return header.substring(7);
        }
        return null;
    }

    private UserPrincipal buildPrincipal(Claims claims) {
        return new UserPrincipal(
                Long.valueOf(claims.getSubject()),
                claims.get("email", String.class),
                claims.get("role", String.class)
        );
    }
}
