# Ny Butik — Güvenlik Tasarımı

## 1. Kimlik Doğrulama Akışı

```
Kullanıcı                  Frontend                  Backend
   │                           │                          │
   │── E-posta/Şifre ─────────►│                          │
   │                           │── POST /auth/login ─────►│
   │                           │                          │── bcrypt.verify
   │                           │                          │── JWT access (15dk)
   │                           │                          │── JWT refresh (7gün)
   │                           │◄── accessToken (body) ───│
   │                           │◄── refreshToken (HttpOnly Cookie)
   │                           │                          │
   │                           │  [Memory'de accessToken] │
   │                           │  [Cookie'de refreshToken]│
   │                           │                          │
   │──── Korumalı istek ───────►│                          │
   │                           │── GET /api + Bearer ────►│
   │                           │                          │── JWT doğrula
   │                           │◄── 200 data ─────────────│
   │                           │                          │
   │  [AccessToken süresi doldu]                          │
   │                           │── POST /auth/refresh ───►│ (cookie otomatik gider)
   │                           │                          │── Refresh token doğrula
   │                           │                          │── Eski refresh iptal et
   │                           │                          │── Yeni çift üret
   │                           │◄── yeni accessToken ─────│
   │                           │◄── yeni refreshToken cookie
```

---

## 2. JWT Yapısı

### Access Token (15 dakika)
```json
{
  "sub": "42",
  "email": "user@example.com",
  "role": "CUSTOMER",
  "iat": 1751100000,
  "exp": 1751100900
}
```

### Refresh Token (7 gün)
- Veritabanında SHA-256 hash'i saklanır (plain token saklanmaz)
- Rotation: her refresh'te yeni token üretilir, eski otomatik revoke edilir
- Şüpheli aktivite (aynı refresh birden fazla kullanım) → tüm session'lar sonlandırılır

---

## 3. Yetkilendirme Matrisi

| Endpoint Grubu              | Guest | Customer | Admin |
|-----------------------------|-------|----------|-------|
| GET /products/**            | ✓     | ✓        | ✓     |
| GET /categories/**          | ✓     | ✓        | ✓     |
| POST /auth/**               | ✓     | ✓        | ✓     |
| GET/PUT /users/me           | ✗     | ✓        | ✓     |
| GET/POST /users/me/addresses| ✗     | ✓        | ✓     |
| GET /cart                   | ✓*    | ✓        | ✓     |
| POST /cart/**               | ✓*    | ✓        | ✓     |
| POST /orders                | ✗     | ✓        | ✗     |
| GET /orders                 | ✗     | ✓        | ✗     |
| GET/POST /wishlist          | ✗     | ✓        | ✗     |
| POST /returns               | ✗     | ✓        | ✗     |
| /admin/**                   | ✗     | ✗        | ✓     |

*Guest: session_id header ile

---

## 4. Spring Security Konfigürasyonu

```java
// SecurityConfig.java (özet)
@Bean
SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    return http
        .csrf(AbstractHttpConfigurer::disable)        // JWT stateless → CSRF minimal
        .sessionManagement(s -> s.sessionCreationPolicy(STATELESS))
        .cors(c -> c.configurationSource(corsConfigurationSource()))
        .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
        .authorizeHttpRequests(auth -> auth
            .requestMatchers(PUBLIC_PATHS).permitAll()
            .requestMatchers("/admin/**").hasRole("ADMIN")
            .requestMatchers(HttpMethod.POST, "/orders").hasRole("CUSTOMER")
            .anyRequest().authenticated()
        )
        .exceptionHandling(e -> e
            .authenticationEntryPoint(customAuthEntryPoint)   // 401 JSON
            .accessDeniedHandler(customAccessDeniedHandler)   // 403 JSON
        )
        .build();
}
```

---

## 5. OWASP Top 10 Karşı Önlemler

### A01 — Broken Access Control
- Her endpoint `@PreAuthorize` ile kısıtlı
- Müşteri kendi kaynağına erişebilir: `order.userId == currentUser.id` kontrolü service katmanında
- Admin endpoint prefix ayrımı + Spring Security rule
- Ürün/sipariş ID tahmin saldırısına karşı: sequential BIGINT yerine public endpoint'lerde slug kullanımı

### A02 — Cryptographic Failures
- Şifreler BCrypt (cost 12) ile hash'lenir — asla plain saklanmaz
- JWT secret minimum 256-bit, env variable'dan gelir
- HTTPS zorunlu (TLS 1.2+), Cloudflare HSTS
- Refresh token hash'i (SHA-256) saklanır

### A03 — Injection
- JPA parametrize sorgular — SQL injection yok
- `ProductSpecification` Criteria API kullanır — string concat yok
- Arama: `pg_tsvector` ile parametre geçilir
- Bean Validation tüm input'ta

### A04 — Insecure Design
- Ödeme verileri (kart numarası) sistemde asla saklanmaz
- İade sadece "DELIVERED" statuslu siparişten açılabilir
- Sipariş iptal: sadece PENDING_PAYMENT veya PAID + PREPARING aşamasında
- Kupon kullanım limitleri veritabanı düzeyinde kontrol edilir (race condition için optimistic lock)

### A05 — Security Misconfiguration
- Spring Boot Actuator: prod'da sadece health/info expose edilir, `/actuator` dışarıya kapatılır
- Stack trace asla API yanıtına eklenmez (GlobalExceptionHandler maskeler)
- CORS: sadece izin verilen origin
- HTTP response headers: X-Content-Type-Options, X-Frame-Options, Referrer-Policy

### A07 — Identification & Authentication Failures
- Giriş başarısızlık limiti: 5 deneme / 15 dakika / IP (Bucket4j)
- Şifre sıfırlama token'ı: tek kullanım, 1 saat geçerli, SHA-256 hash'li
- E-posta doğrulama zorunlu (yapılandırılabilir)
- Refresh token rotation + tek cihaz revoke

### A09 — Security Logging & Monitoring
- Her başarısız giriş denemesi loglanır (IP, timestamp, e-posta)
- Yetkisiz erişim girişimleri loglanır
- Şüpheli refresh token kullanımı loglanır ve alarm tetikler
- Correlation-ID ile istek izlenebilir

---

## 6. Güvenlik HTTP Başlıkları (Spring Security)

```java
http.headers(headers -> headers
    .contentTypeOptions(withDefaults())           // X-Content-Type-Options: nosniff
    .frameOptions(f -> f.deny())                  // X-Frame-Options: DENY
    .referrerPolicy(r -> r.policy(NO_REFERRER_WHEN_DOWNGRADE))
    .contentSecurityPolicy(csp -> csp.policyDirectives(
        "default-src 'self'; " +
        "script-src 'self'; " +
        "style-src 'self' 'unsafe-inline'; " +    // Tailwind için
        "img-src 'self' data: https://r2.nybutik.com; " +
        "connect-src 'self' https://api.nybutik.com;"
    ))
);
```

---

## 7. Rate Limiting Implementasyonu (Bucket4j)

```java
@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

    private Bucket resolveBucket(String key, BucketConfig config) {
        return buckets.computeIfAbsent(key, k ->
            Bucket.builder()
                  .addLimit(Bandwidth.classic(config.capacity(),
                            Refill.greedy(config.capacity(), config.duration())))
                  .build()
        );
    }
}
```

---

## 8. Veri Gizliliği (KVKK Uyumu)

- Müşteri verileri: yalnızca hizmet amacıyla işlenir
- Veri silme: `DELETE /users/me` → soft delete + veri anonimleştirme (e-posta, ad hashlenir)
- Admin müşteri listesi: şifre alanı hiçbir response'ta dönmez (`@JsonIgnore` + MapStruct exclude)
- Log'larda e-posta maskelenir: `a***@example.com`
- Çerez banner zorunlu (frontend tarafı)

---

## 9. Güvenlik Test Planı

| Test Türü                    | Araç/Yöntem                        | Frekans        |
|------------------------------|-------------------------------------|----------------|
| Dependency vulnerability scan| `mvn dependency-check:check`        | CI'da her push |
| SAST (statik analiz)         | SpotBugs + FindSecBugs plugin       | CI'da          |
| API fuzzing                  | OWASP ZAP (baseline scan)           | Her sprint     |
| JWT test                     | Manuel: alg:none, key confusion     | Phase 1 çıkış  |
| Penetrasyon testi            | Harici (fırsat buldukça)            | Yıllık         |
