# Ny Butik — Gereksinim Analizi

## 1. Proje Özeti

**Ny Butik**, tesettür giyim odaklı, sıfırdan kurulan bir e-ticaret platformudur.
Başlangıç trafiği düşük olacak; bununla birlikte mimari, ilerleyen dönemde yatay
ölçeklenmeye hazır biçimde tasarlanacaktır.

---

## 2. Paydaşlar & Roller

| Rol       | Açıklama                                                                 |
|-----------|--------------------------------------------------------------------------|
| **Guest** | Kayıtsız ziyaretçi; ürünleri görebilir, arayabilir, filtreleyebilir.    |
| **Customer** | Kayıtlı müşteri; sepet, sipariş, iade, favori, kargo takibi yapabilir. |
| **Admin** | Tam yetkili yönetici; ürün, stok, sipariş, kupon, iade, rapor yönetimi. |

---

## 3. Fonksiyonel Gereksinimler

### 3.1 Katalog & Ürün Yönetimi
- Kategori ağacı (hiyerarşik, en fazla 3 seviye önerilir)
- Ürün: isim, slug, açıklama (rich text), kısa açıklama, marka/etiket listesi
- Varyant sistemi: Renk × Beden kombinasyonu
- Her varyanta özgü SKU, fiyat (liste / indirimli), stok adedi
- Çoklu ürün fotoğrafı (sıralı, varyanta bağlanabilir)
- Ürün durumu: DRAFT / ACTIVE / ARCHIVED
- Ürün etiketleri (tags) ve özel özellikler (attributes key-value)

### 3.2 Arama & Filtreleme (Guest & Customer)
- Tam metin arama (PostgreSQL `tsvector` — başlangıç için yeterli)
- Filtreler: kategori, renk, beden, fiyat aralığı, indirim durumu, etiket
- Sıralama: fiyat, yenilik, popülerlik (sipariş sayısı)
- Sayfalama (cursor-based öneri; offset ile başlanabilir)

### 3.3 Müşteri Hesabı
- Kayıt (e-posta + şifre), e-posta doğrulama
- Giriş / çıkış (JWT access + refresh token)
- Profil düzenleme, şifre değiştirme
- Adres defteri (birden fazla adres, varsayılan seçimi)

### 3.4 Favori Listesi
- Ürün favorilere ekleme / çıkarma (Customer)
- Favori listesi görüntüleme

### 3.5 Sepet
- Oturum bazlı sepet (Guest) → hesap açınca birleştirme (merge)
- Varyant düzeyinde ekleme, miktar güncelleme, silme
- Stok kontrolü (rezervasyon yok, soft check)
- Kupon kodu uygulama & kaldırma
- Sepet özeti: ara toplam, indirim, kargo ücreti, genel toplam

### 3.6 Sipariş Akışı
```
CART → PENDING_PAYMENT → PAYMENT_PROCESSING → PAYMENT_FAILED
                                           ↓
                                     PAID → PREPARING → SHIPPED → DELIVERED
                                                               ↓
                                                        RETURN_REQUESTED → RETURN_APPROVED
                                                                         → RETURN_REJECTED
                                                               ↓
                                                        REFUNDED
                                                    CANCELLED (her aşamadan — kısıtlı)
```
- Sipariş numarası (okunabilir: NY-20260628-00001)
- Kargo takip numarası ve takip URL'i (simüle)
- Fatura adresi / teslimat adresi (anlık snapshot — adres sonradan değişse bile sipariş kaydı korunur)
- Sipariş geçmişi (Customer)

### 3.7 Ödeme (Simüle)
- `PaymentService` interface üzerinden soyutlanmış
- `MockPaymentAdapter` → başarı/başarısız senaryoları test edilebilir
- Ödeme kaydı: provider, referans no, tutar, para birimi, durum, timestamp
- İleride Stripe / iyzico / PayTR adapters kolayca eklenebilir

### 3.8 Kargo (Simüle)
- `ShipmentService` interface üzerinden soyutlanmış
- `MockShipmentAdapter` → takip no üretir, durum günceller
- İleride Yurtiçi Kargo / MNG / Aras adapters eklenebilir

### 3.9 İade Yönetimi
```
RETURN_REQUESTED → RETURN_APPROVED → RETURN_RECEIVED → REFUNDED
                 → RETURN_REJECTED
```
- Müşteri iade talebi açar (sebep, açıklama, fotoğraf opsiyonel)
- Admin onaylar / reddeder
- Onaylanınca kargo kodu üretilir
- Ürün teslim alınınca iade tamamlanır, ödeme iadesi tetiklenir

### 3.10 Kupon & İndirim
- Kupon kodu bazlı (tek kullanım / çok kullanım / kullanıcı başına 1 kez)
- İndirim tipi: sabit tutar veya yüzde
- Minimum sepet tutarı, son kullanma tarihi
- Ürün / kategori bazlı kısıtlama (opsiyonel — Phase 2)

### 3.11 Bildirimler
- E-posta: kayıt onayı, sipariş onayı, kargo başladı, teslimat, iade durumu
- Uygulama içi bildirimler (Phase 2: WebSocket veya SSE)
- `NotificationService` interface → başlangıçta e-posta (JavaMail / Resend API)

### 3.12 Admin Paneli
| Ekran                  | Açıklama                                               |
|------------------------|--------------------------------------------------------|
| Dashboard              | Günlük/haftalık/aylık satış, sipariş sayısı, top ürünler |
| Ürün Yönetimi          | Listeleme, ekleme, düzenleme, arşivleme                |
| Kategori Yönetimi      | Ağaç yapısı, CRUD                                     |
| Stok Yönetimi          | Varyant bazlı stok, düşük stok uyarısı               |
| Sipariş Yönetimi       | Sipariş listesi, detay, durum güncelleme              |
| İade Yönetimi          | İade talepleri, onay/red                              |
| Kupon Yönetimi         | Kupon oluşturma, listeleme, pasife alma               |
| Müşteri Listesi        | Arama, detay görüntüleme (KVKK uyumu)                |
| Raporlar               | Temel satış istatistikleri, CSV export                |

---

## 4. Non-Fonksiyonel Gereksinimler

### 4.1 Performans
- API yanıt süresi p95 < 300ms (başlangıç yükü)
- Ürün listesi: HTTP önbelleği (Cache-Control) + veritabanı sorgu optimizasyonu
- N+1 problemi: JPA `JOIN FETCH` / EntityGraph ile giderilmeli
- Sayfa ilk yükleme: LCP < 2.5s (Core Web Vitals)

### 4.2 Güvenlik
- HTTPS zorunlu (TLS 1.2+)
- JWT (access 15dk, refresh 7 gün — HttpOnly cookie)
- OWASP Top 10 dikkate alınmalı
- Rate limiting (Spring Bucket4j veya API Gateway düzeyinde)
- SQL Injection: JPA parametrized queries
- XSS: React default encoding + Content-Security-Policy header
- CSRF: stateless JWT ile minimal risk; SameSite cookie politikası
- Input validation: Bean Validation (backend) + Zod (frontend)
- Hassas veriler (şifre) bcrypt (cost 12)
- Ödeme verisi sistemde saklanmaz (PCI-DSS uyumu için)

### 4.3 SEO
- Server-Side Rendering veya Static Generation (Next.js Phase 2 opsiyonu)
- Başlangıçta React SPA + prerender-meta için React Helmet (sonradan Next.js'e taşınabilir yapı)
- Anlamlı URL'ler: `/urunler/elbise/siyah-abiye-123`
- Sitemap.xml endpoint (backend üretir)
- Open Graph meta etiketleri

### 4.4 Erişilebilirlik (a11y)
- WCAG 2.1 AA hedefi
- shadcn/ui bileşenleri Radix UI tabanlı → erişilebilirlik built-in
- Klavye navigasyonu, ARIA etiketleri, renk kontrast kontrolü

### 4.5 Gözlemlenebilirlik
- Yapısal loglama (JSON): SLF4J + Logback
- Request ID / Correlation ID her isteğe eklenir (MDC)
- Health endpoint: `/actuator/health`
- Metrics: Spring Actuator → Micrometer (Prometheus hazır — Phase 2)
- Hata izleme: Sentry (frontend + backend, ücretsiz tier yeterli)

### 4.6 Maliyet & Ölçeklenebilirlik
- Başlangıç: tek sunucu (VPS veya küçük cloud instance)
- Veritabanı: yönetilen PostgreSQL (Railway / Supabase / AWS RDS Free Tier)
- Dosya depolama: S3-uyumlu (Cloudflare R2 — çıkış ücreti yok)
- CDN: Cloudflare (ücretsiz tier)
- Konteynerizasyon: Docker + docker-compose (gelecekte Kubernetes'e geçiş kolay)

---

## 5. Teknoloji Kararları & Gerekçeler

| Karar                  | Seçim                   | Gerekçe                                                     |
|------------------------|-------------------------|-------------------------------------------------------------|
| Backend dil/framework  | Java 21 + Spring Boot 3 | Olgunluk, ekosistem, Virtual Threads (Loom) hazır          |
| ORM                    | Spring Data JPA (Hibernate) | Üretkenlik; JPQL ile karmaşık sorgular yönetilebilir     |
| Migration              | Flyway                  | Veritabanı versiyonlaması zorunlu                          |
| Mapping                | MapStruct               | Compile-time, reflection yok, hızlı                        |
| Auth                   | Spring Security + JWT   | Stateless, ölçeklenir; session replikasyonu gerekmez       |
| Validation             | Bean Validation (Jakarta) | Standart, annotation tabanlı                             |
| API Docs               | SpringDoc (OpenAPI 3)   | Swagger UI + otomatik spec üretimi                         |
| Frontend framework     | React 18 + TypeScript   | Ekosistem, tip güvenliği                                   |
| Routing                | React Router v6         | Nested routes, loader/action desteği                       |
| Server state           | TanStack Query v5       | Caching, optimistic updates, devtools                      |
| Forms                  | React Hook Form + Zod   | Performanslı, tip güvenli validasyon                       |
| Styling                | Tailwind CSS v3         | Utility-first, küçük bundle                                |
| UI bileşenleri         | shadcn/ui               | Radix UI tabanlı, özelleştirilebilir, erişilebilir        |
| Animasyon              | Framer Motion           | Profesyonel animasyon, layout transitions                  |
| Build tool             | Vite                    | HMR hızı, modern bundling                                  |
