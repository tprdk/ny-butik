# Ny Butik — Sistem Mimarisi

## 1. Genel Yaklaşım: Modüler Monolith

```
┌──────────────────────────────────────────────────────────┐
│                     MODÜLER MONOLİTH                     │
│                                                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │ catalog  │ │  order   │ │  user    │ │  admin   │   │
│  │  module  │ │  module  │ │  module  │ │  module  │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                 │
│  │ payment  │ │shipment  │ │  notif.  │                 │
│  │  module  │ │  module  │ │  module  │                 │
│  └──────────┘ └──────────┘ └──────────┘                 │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │              Shared Kernel (infra, security)       │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

**Neden Modüler Monolith?**
- Başlangıç trafiği düşük → microservice overhead gereksiz
- Tek deployment, düşük operasyonel maliyet
- Modül sınırları net tutulursa ileride servise çıkarılabilir
- Veritabanı paylaşımlı ama şema ayrı (catalog.*, order.*, user.* gibi PostgreSQL schema'lar)

---

## 2. Katmanlı Mimari (Her Modül İçin)

```
Controller (REST / OpenAPI)
        │
        ▼
   Service (business logic)
        │
      ┌─┴──────────────┐
      ▼                ▼
Repository         External Adapters
(Spring Data JPA)  (Payment, Shipment, Notification)
      │
      ▼
  PostgreSQL
```

### Katman Kuralları
- Controller → Service → Repository (tek yönlü bağımlılık)
- Modüller arası iletişim: sadece `ApplicationEvent` veya açık service interface üzerinden
  (paket-private erişim, doğrudan çapraz modül çağrısı yasak)
- DTO'lar API sınırında kalır; entity'ler service katmanını geçmez
- MapStruct mapper'lar `mapper` alt paketinde toplanır

---

## 3. Altyapı Haritası

```
┌─────────────────────────────────────────────────────────────────────┐
│                         KULLANICI                                    │
└───────────────────────────────┬─────────────────────────────────────┘
                                │ HTTPS
                                ▼
                    ┌───────────────────────┐
                    │   Cloudflare CDN      │  ← Static assets, DDoS
                    └───────────┬───────────┘
                                │
              ┌─────────────────┴──────────────────┐
              │                                    │
              ▼                                    ▼
  ┌───────────────────────┐          ┌───────────────────────┐
  │  React SPA (Vite)     │          │  Spring Boot API       │
  │  (Static hosting /    │          │  (VPS / Cloud Run)     │
  │   Cloudflare Pages)   │          │  Port: 8080            │
  └───────────────────────┘          └──────────┬────────────┘
                                                │
                         ┌──────────────────────┼──────────────────────┐
                         │                      │                      │
                         ▼                      ▼                      ▼
              ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
              │   PostgreSQL     │  │  Cloudflare R2   │  │   Resend API     │
              │  (Railway /      │  │  (Fotoğraf       │  │  (Transactional  │
              │   Supabase)      │  │   depolama)      │  │   e-posta)       │
              └──────────────────┘  └──────────────────┘  └──────────────────┘
```

---

## 4. Güvenlik Katmanı

```
Request
   │
   ▼
[Cloudflare] → Rate limit, WAF, DDoS koruması
   │
   ▼
[Spring Security Filter Chain]
   ├── CorsFilter
   ├── JwtAuthenticationFilter  ← access token doğrulama
   ├── RoleAuthorizationFilter  ← @PreAuthorize
   └── ExceptionTranslationFilter → 401/403
```

### JWT Stratejisi
- **Access Token:** 15 dakika, `Authorization: Bearer` header
- **Refresh Token:** 7 gün, `HttpOnly; SameSite=Strict` cookie
- Refresh token rotation: her yenilemede eski geçersiz kılınır
- Refresh token veritabanında tutulur (revokasyon için)

---

## 5. Modül Bağımlılık Grafiği

```
        ┌─────────┐    ┌─────────┐
        │  user   │    │ catalog │
        └────┬────┘    └────┬────┘
             │              │
             └──────┬───────┘
                    ▼
               ┌─────────┐
               │  order  │
               └────┬────┘
          ┌─────────┼─────────┐
          ▼         ▼         ▼
      ┌───────┐ ┌───────┐ ┌───────┐
      │payment│ │shipm. │ │notif. │
      └───────┘ └───────┘ └───────┘
          │         │         │
          └─────────┴─────────┘
                    │
                    ▼
              ┌──────────┐
              │  shared  │
              │  kernel  │
              └──────────┘
```

**Kural:** Modüller yalnızca aşağıya bağımlı olabilir; döngüsel bağımlılık yasak.

---

## 6. Event-Driven Akış (Modüller Arası)

Spring `ApplicationEventPublisher` kullanılır. Başlangıç için sync/in-process yeterli;
Phase 2'de Kafka/RabbitMQ ile async'e geçilebilir.

```
OrderService.completeOrder()
   │
   ├── publishes: OrderPaidEvent
   │       ├── PaymentModule listens → ödeme kaydı günceller
   │       ├── ShipmentModule listens → kargo oluşturur
   │       └── NotificationModule listens → e-posta gönderir
   │
   └── publishes: StockDecrementEvent
           └── CatalogModule listens → stok düşürür
```

---

## 7. Ölçeklenme Yolu (Phase 3+)

```
Phase 1: Modüler Monolith
         ↓
Phase 2: Yatay çoğaltma (stateless → Redis session/cache ekle)
         ↓
Phase 3: Modül ayrıştırması → Microservice
         - catalog-service (yüksek okuma trafiği → Redis önbellekleme)
         - order-service
         - notification-service (async, Kafka consumer)
         - Kubernetes orchestration
```

---

## 8. Geliştirme Ortamları

| Ortam       | Amaç                        | Veritabanı          | Not                         |
|-------------|-----------------------------|---------------------|-----------------------------|
| local       | Geliştirici makinesi        | Docker PostgreSQL   | H2 kullanılmaz (prod parity)|
| dev         | CI/CD entegrasyon testi     | Railway/Supabase dev| Her PR otomatik deploy      |
| staging     | UAT, demo                   | Ayrı DB             | Prod verisinin kopyası yok  |
| production  | Canlı                       | Yönetilen PostgreSQL| Otomatik yedekleme          |

---

## 9. CI/CD Pipeline (Öneri)

```
Git Push → GitHub Actions
    ├── Backend: mvn test → mvn build → Docker build → push registry
    ├── Frontend: pnpm test → pnpm build → Cloudflare Pages deploy
    └── DB Migration: Flyway (Spring boot startup'ta çalışır)
```

- **Test stratejisi:**
  - Unit test: JUnit 5 + Mockito
  - Entegrasyon testi: `@SpringBootTest` + Testcontainers (gerçek PostgreSQL container)
  - Frontend: Vitest + React Testing Library
  - E2E: Playwright (Phase 2)
