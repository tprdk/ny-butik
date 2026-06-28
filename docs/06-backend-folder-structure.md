# Ny Butik — Backend Klasör Yapısı (Java / Spring Boot)

## Proje Yapısı

```
ny-butik-api/
├── src/
│   ├── main/
│   │   ├── java/com/nybutik/
│   │   │   ├── NyButikApplication.java
│   │   │   │
│   │   │   ├── config/                         # Global konfigürasyonlar
│   │   │   │   ├── SecurityConfig.java
│   │   │   │   ├── CorsConfig.java
│   │   │   │   ├── OpenApiConfig.java
│   │   │   │   ├── JpaConfig.java
│   │   │   │   ├── AsyncConfig.java
│   │   │   │   └── RateLimitConfig.java
│   │   │   │
│   │   │   ├── shared/                         # Paylaşılan altyapı
│   │   │   │   ├── exception/
│   │   │   │   │   ├── GlobalExceptionHandler.java
│   │   │   │   │   ├── BusinessException.java
│   │   │   │   │   ├── ResourceNotFoundException.java
│   │   │   │   │   └── ConflictException.java
│   │   │   │   ├── response/
│   │   │   │   │   ├── ApiResponse.java
│   │   │   │   │   └── PageResponse.java
│   │   │   │   ├── security/
│   │   │   │   │   ├── JwtService.java
│   │   │   │   │   ├── JwtAuthenticationFilter.java
│   │   │   │   │   ├── UserPrincipal.java
│   │   │   │   │   └── SecurityUtils.java
│   │   │   │   ├── util/
│   │   │   │   │   ├── SlugUtils.java
│   │   │   │   │   ├── OrderNumberGenerator.java
│   │   │   │   │   └── PriceUtils.java
│   │   │   │   └── audit/
│   │   │   │       └── AuditableEntity.java   # @MappedSuperclass: id, createdAt, updatedAt
│   │   │   │
│   │   │   ├── module/
│   │   │   │   │
│   │   │   │   ├── user/
│   │   │   │   │   ├── controller/
│   │   │   │   │   │   ├── AuthController.java
│   │   │   │   │   │   └── UserController.java
│   │   │   │   │   ├── service/
│   │   │   │   │   │   ├── AuthService.java
│   │   │   │   │   │   ├── UserService.java
│   │   │   │   │   │   └── AddressService.java
│   │   │   │   │   ├── repository/
│   │   │   │   │   │   ├── UserRepository.java
│   │   │   │   │   │   ├── RefreshTokenRepository.java
│   │   │   │   │   │   └── AddressRepository.java
│   │   │   │   │   ├── entity/
│   │   │   │   │   │   ├── User.java
│   │   │   │   │   │   ├── RefreshToken.java
│   │   │   │   │   │   └── Address.java
│   │   │   │   │   ├── dto/
│   │   │   │   │   │   ├── request/
│   │   │   │   │   │   │   ├── RegisterRequest.java
│   │   │   │   │   │   │   ├── LoginRequest.java
│   │   │   │   │   │   │   ├── UpdateProfileRequest.java
│   │   │   │   │   │   │   └── AddressRequest.java
│   │   │   │   │   │   └── response/
│   │   │   │   │   │       ├── AuthResponse.java
│   │   │   │   │   │       ├── UserResponse.java
│   │   │   │   │   │       └── AddressResponse.java
│   │   │   │   │   ├── mapper/
│   │   │   │   │   │   └── UserMapper.java
│   │   │   │   │   └── enums/
│   │   │   │   │       └── Role.java
│   │   │   │   │
│   │   │   │   ├── catalog/
│   │   │   │   │   ├── controller/
│   │   │   │   │   │   ├── CategoryController.java
│   │   │   │   │   │   ├── ProductController.java        # Public
│   │   │   │   │   │   ├── AdminCategoryController.java
│   │   │   │   │   │   └── AdminProductController.java
│   │   │   │   │   ├── service/
│   │   │   │   │   │   ├── CategoryService.java
│   │   │   │   │   │   ├── ProductService.java
│   │   │   │   │   │   ├── ProductVariantService.java
│   │   │   │   │   │   └── ProductImageService.java
│   │   │   │   │   ├── repository/
│   │   │   │   │   │   ├── CategoryRepository.java
│   │   │   │   │   │   ├── ProductRepository.java
│   │   │   │   │   │   ├── ProductVariantRepository.java
│   │   │   │   │   │   ├── ProductImageRepository.java
│   │   │   │   │   │   ├── ColorRepository.java
│   │   │   │   │   │   └── SizeRepository.java
│   │   │   │   │   ├── entity/
│   │   │   │   │   │   ├── Category.java
│   │   │   │   │   │   ├── Product.java
│   │   │   │   │   │   ├── ProductVariant.java
│   │   │   │   │   │   ├── ProductImage.java
│   │   │   │   │   │   ├── Color.java
│   │   │   │   │   │   └── Size.java
│   │   │   │   │   ├── dto/
│   │   │   │   │   │   ├── request/
│   │   │   │   │   │   └── response/
│   │   │   │   │   ├── mapper/
│   │   │   │   │   │   └── ProductMapper.java
│   │   │   │   │   ├── specification/
│   │   │   │   │   │   └── ProductSpecification.java    # JPA Criteria / Spring Spec
│   │   │   │   │   └── enums/
│   │   │   │   │       └── ProductStatus.java
│   │   │   │   │
│   │   │   │   ├── cart/
│   │   │   │   │   ├── controller/
│   │   │   │   │   │   └── CartController.java
│   │   │   │   │   ├── service/
│   │   │   │   │   │   └── CartService.java
│   │   │   │   │   ├── repository/
│   │   │   │   │   │   ├── CartRepository.java
│   │   │   │   │   │   └── CartItemRepository.java
│   │   │   │   │   ├── entity/
│   │   │   │   │   │   ├── Cart.java
│   │   │   │   │   │   └── CartItem.java
│   │   │   │   │   └── dto/
│   │   │   │   │       ├── request/
│   │   │   │   │       └── response/
│   │   │   │   │
│   │   │   │   ├── order/
│   │   │   │   │   ├── controller/
│   │   │   │   │   │   ├── OrderController.java
│   │   │   │   │   │   └── AdminOrderController.java
│   │   │   │   │   ├── service/
│   │   │   │   │   │   └── OrderService.java
│   │   │   │   │   ├── repository/
│   │   │   │   │   │   ├── OrderRepository.java
│   │   │   │   │   │   ├── OrderItemRepository.java
│   │   │   │   │   │   └── OrderStatusHistoryRepository.java
│   │   │   │   │   ├── entity/
│   │   │   │   │   │   ├── Order.java
│   │   │   │   │   │   ├── OrderItem.java
│   │   │   │   │   │   └── OrderStatusHistory.java
│   │   │   │   │   ├── dto/
│   │   │   │   │   │   ├── request/
│   │   │   │   │   │   └── response/
│   │   │   │   │   ├── mapper/
│   │   │   │   │   │   └── OrderMapper.java
│   │   │   │   │   ├── event/
│   │   │   │   │   │   ├── OrderPaidEvent.java
│   │   │   │   │   │   └── OrderStatusChangedEvent.java
│   │   │   │   │   └── enums/
│   │   │   │   │       └── OrderStatus.java
│   │   │   │   │
│   │   │   │   ├── payment/
│   │   │   │   │   ├── controller/
│   │   │   │   │   │   └── PaymentCallbackController.java  # Webhook handler
│   │   │   │   │   ├── service/
│   │   │   │   │   │   ├── PaymentService.java             # Interface
│   │   │   │   │   │   └── PaymentFacade.java              # Adapter seçici
│   │   │   │   │   ├── adapter/
│   │   │   │   │   │   ├── MockPaymentAdapter.java
│   │   │   │   │   │   └── IyzicoPaymentAdapter.java      # Phase 2 iskelet
│   │   │   │   │   ├── repository/
│   │   │   │   │   │   └── PaymentRepository.java
│   │   │   │   │   ├── entity/
│   │   │   │   │   │   └── Payment.java
│   │   │   │   │   └── enums/
│   │   │   │   │       └── PaymentStatus.java
│   │   │   │   │
│   │   │   │   ├── shipment/
│   │   │   │   │   ├── service/
│   │   │   │   │   │   ├── ShipmentService.java            # Interface
│   │   │   │   │   │   └── ShipmentFacade.java
│   │   │   │   │   ├── adapter/
│   │   │   │   │   │   └── MockShipmentAdapter.java
│   │   │   │   │   ├── repository/
│   │   │   │   │   │   └── ShipmentRepository.java
│   │   │   │   │   ├── entity/
│   │   │   │   │   │   └── Shipment.java
│   │   │   │   │   └── enums/
│   │   │   │   │       └── ShipmentStatus.java
│   │   │   │   │
│   │   │   │   ├── return_/                               # 'return' reserved word → return_
│   │   │   │   │   ├── controller/
│   │   │   │   │   │   ├── ReturnController.java
│   │   │   │   │   │   └── AdminReturnController.java
│   │   │   │   │   ├── service/
│   │   │   │   │   │   └── ReturnService.java
│   │   │   │   │   ├── repository/
│   │   │   │   │   │   └── ReturnRepository.java
│   │   │   │   │   ├── entity/
│   │   │   │   │   │   ├── Return.java
│   │   │   │   │   │   └── ReturnItem.java
│   │   │   │   │   └── enums/
│   │   │   │   │       └── ReturnStatus.java
│   │   │   │   │
│   │   │   │   ├── coupon/
│   │   │   │   │   ├── controller/
│   │   │   │   │   │   └── AdminCouponController.java
│   │   │   │   │   ├── service/
│   │   │   │   │   │   └── CouponService.java
│   │   │   │   │   ├── repository/
│   │   │   │   │   │   └── CouponRepository.java
│   │   │   │   │   ├── entity/
│   │   │   │   │   │   └── Coupon.java
│   │   │   │   │   └── enums/
│   │   │   │   │       └── DiscountType.java
│   │   │   │   │
│   │   │   │   ├── notification/
│   │   │   │   │   ├── service/
│   │   │   │   │   │   ├── NotificationService.java        # Interface
│   │   │   │   │   │   └── NotificationFacade.java
│   │   │   │   │   ├── adapter/
│   │   │   │   │   │   └── ResendEmailAdapter.java
│   │   │   │   │   ├── repository/
│   │   │   │   │   │   └── NotificationLogRepository.java
│   │   │   │   │   ├── entity/
│   │   │   │   │   │   └── NotificationLog.java
│   │   │   │   │   ├── template/                          # E-posta Thymeleaf şablonları
│   │   │   │   │   │   # (resources/templates/email/ altında)
│   │   │   │   │   └── listener/
│   │   │   │   │       ├── OrderPaidEventListener.java
│   │   │   │   │       └── OrderStatusChangedEventListener.java
│   │   │   │   │
│   │   │   │   ├── wishlist/
│   │   │   │   │   ├── controller/
│   │   │   │   │   │   └── WishlistController.java
│   │   │   │   │   ├── service/
│   │   │   │   │   │   └── WishlistService.java
│   │   │   │   │   ├── repository/
│   │   │   │   │   │   └── WishlistRepository.java
│   │   │   │   │   └── entity/
│   │   │   │   │       └── WishlistItem.java
│   │   │   │   │
│   │   │   │   ├── admin/
│   │   │   │   │   ├── controller/
│   │   │   │   │   │   ├── AdminDashboardController.java
│   │   │   │   │   │   ├── AdminCustomerController.java
│   │   │   │   │   │   └── AdminReportController.java
│   │   │   │   │   └── service/
│   │   │   │   │       ├── DashboardService.java
│   │   │   │   │       └── ReportService.java
│   │   │   │   │
│   │   │   │   └── storage/
│   │   │   │       ├── StorageService.java                # Interface
│   │   │   │       └── CloudflareR2StorageAdapter.java
│   │   │   │
│   │   ├── resources/
│   │   │   ├── application.yml
│   │   │   ├── application-local.yml
│   │   │   ├── application-dev.yml
│   │   │   ├── application-staging.yml
│   │   │   ├── application-prod.yml
│   │   │   ├── db/migration/                             # Flyway
│   │   │   │   ├── V1__create_users.sql
│   │   │   │   ├── V2__create_catalog.sql
│   │   │   │   ├── V3__create_cart.sql
│   │   │   │   ├── V4__create_order.sql
│   │   │   │   ├── V5__create_payment_shipment.sql
│   │   │   │   ├── V6__create_return.sql
│   │   │   │   ├── V7__create_coupon.sql
│   │   │   │   ├── V8__create_wishlist.sql
│   │   │   │   ├── V9__create_notification_log.sql
│   │   │   │   └── V10__seed_colors_sizes.sql
│   │   │   └── templates/email/                          # Thymeleaf e-posta şablonları
│   │   │       ├── order-confirmed.html
│   │   │       ├── shipped.html
│   │   │       ├── delivered.html
│   │   │       ├── return-status.html
│   │   │       └── email-verification.html
│   │
│   └── test/
│       └── java/com/nybutik/
│           ├── integration/                              # @SpringBootTest + Testcontainers
│           │   ├── auth/
│           │   ├── catalog/
│           │   ├── order/
│           │   └── cart/
│           └── unit/
│               ├── catalog/
│               ├── order/
│               └── coupon/
│
├── Dockerfile
├── docker-compose.yml                                    # Local geliştirme
├── pom.xml
└── .env.example
```

---

## Temel Bağımlılıklar (pom.xml özeti)

```xml
<dependencies>
  <!-- Web -->
  <dependency>spring-boot-starter-web</dependency>
  <dependency>spring-boot-starter-validation</dependency>

  <!-- Security -->
  <dependency>spring-boot-starter-security</dependency>
  <dependency>jjwt-api:0.12.x</dependency>

  <!-- Data -->
  <dependency>spring-boot-starter-data-jpa</dependency>
  <dependency>org.flywaydb:flyway-core</dependency>
  <dependency>org.postgresql:postgresql</dependency>

  <!-- Mapping -->
  <dependency>org.mapstruct:mapstruct:1.6.x</dependency>
  <dependency>org.projectlombok:lombok</dependency>

  <!-- OpenAPI -->
  <dependency>org.springdoc:springdoc-openapi-starter-webmvc-ui:2.x</dependency>

  <!-- Rate Limiting -->
  <dependency>com.bucket4j:bucket4j-core</dependency>

  <!-- E-posta -->
  <dependency>spring-boot-starter-mail</dependency>
  <dependency>spring-boot-starter-thymeleaf</dependency>

  <!-- AWS S3 SDK (Cloudflare R2 uyumlu) -->
  <dependency>software.amazon.awssdk:s3</dependency>

  <!-- Observability -->
  <dependency>spring-boot-starter-actuator</dependency>
  <dependency>io.micrometer:micrometer-registry-prometheus</dependency>

  <!-- Test -->
  <dependency>spring-boot-starter-test</dependency>
  <dependency>org.testcontainers:postgresql</dependency>
</dependencies>
```

---

## application.yml Yapısı

```yaml
spring:
  datasource:
    url: ${DB_URL}
    username: ${DB_USER}
    password: ${DB_PASSWORD}
  jpa:
    hibernate:
      ddl-auto: validate          # Flyway yönetir, Hibernate dokunmaz
    open-in-view: false           # Anti-pattern kapatılır
    properties:
      hibernate:
        default_batch_fetch_size: 20  # N+1 azaltır
  flyway:
    enabled: true
    locations: classpath:db/migration

app:
  jwt:
    secret: ${JWT_SECRET}
    access-token-expiry: 900      # saniye (15 dk)
    refresh-token-expiry: 604800  # saniye (7 gün)
  cors:
    allowed-origins: ${FRONTEND_URL}
  storage:
    provider: cloudflare-r2
    bucket: ${R2_BUCKET}
    endpoint: ${R2_ENDPOINT}
    access-key: ${R2_ACCESS_KEY}
    secret-key: ${R2_SECRET_KEY}
  payment:
    provider: mock                # mock | iyzico | stripe
  shipment:
    provider: mock
  notification:
    email:
      provider: resend
      api-key: ${RESEND_API_KEY}
      from: noreply@nybutik.com
  shipping:
    base-fee: 49.90
    free-shipping-threshold: 500.00
```
