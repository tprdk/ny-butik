package com.nybutik.shared.security;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class RateLimitFilter extends OncePerRequestFilter {

    @Value("${app.rate-limit.enabled:true}")
    private boolean enabled;

    @Value("${app.rate-limit.login.capacity:10}")
    private int loginCapacity;

    @Value("${app.rate-limit.login.refill-minutes:1}")
    private int loginRefillMinutes;

    @Value("${app.rate-limit.register.capacity:5}")
    private int registerCapacity;

    @Value("${app.rate-limit.register.refill-hours:1}")
    private int registerRefillHours;

    private final Map<String, Bucket> loginBuckets = new ConcurrentHashMap<>();
    private final Map<String, Bucket> registerBuckets = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        if (!enabled) {
            chain.doFilter(request, response);
            return;
        }

        String uri = request.getRequestURI();
        String ip = getClientIp(request);

        if (uri.equals("/api/v1/auth/login") && "POST".equals(request.getMethod())) {
            Bucket bucket = loginBuckets.computeIfAbsent(ip, k -> buildBucket(loginCapacity, Duration.ofMinutes(loginRefillMinutes)));
            if (!bucket.tryConsume(1)) {
                sendTooManyRequests(response);
                return;
            }
        } else if (uri.equals("/api/v1/auth/register") && "POST".equals(request.getMethod())) {
            Bucket bucket = registerBuckets.computeIfAbsent(ip, k -> buildBucket(registerCapacity, Duration.ofHours(registerRefillHours)));
            if (!bucket.tryConsume(1)) {
                sendTooManyRequests(response);
                return;
            }
        }

        chain.doFilter(request, response);
    }

    private Bucket buildBucket(int capacity, Duration refillPeriod) {
        return Bucket.builder()
                .addLimit(Bandwidth.builder()
                        .capacity(capacity)
                        .refillGreedy(capacity, refillPeriod)
                        .build())
                .build();
    }

    private String getClientIp(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        return (xff != null && !xff.isBlank()) ? xff.split(",")[0].strip() : request.getRemoteAddr();
    }

    private void sendTooManyRequests(HttpServletResponse response) throws IOException {
        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write("{\"status\":429,\"title\":\"Too Many Requests\",\"detail\":\"Çok fazla istek gönderildi. Lütfen bekleyin.\"}");
    }
}
