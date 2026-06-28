# Ny Butik — Sprint Planı

## Sprint Yapısı
- Sprint süresi: 2 hafta
- Toplam Phase 1 süresi: ~16 hafta (8 sprint)
- Her sprint: backend + frontend birlikte teslim edilir
- Definition of Done: kod review + entegrasyon testi + Swagger'da dokümante

---

## Sprint 0 — Altyapı Kurulumu (Hafta 1-2)

### Backend
- [ ] Spring Boot projesi oluştur (Spring Initializr)
- [ ] Temel bağımlılıklar (pom.xml)
- [ ] Docker Compose: PostgreSQL + pgAdmin
- [ ] application.yml profil yapısı (local/dev/prod)
- [ ] Flyway entegrasyonu, ilk migration (boş schema)
- [ ] `AuditableEntity` base class
- [ ] `GlobalExceptionHandler` + Problem Details format
- [ ] `ApiResponse<T>` wrapper
- [ ] CORS konfigürasyonu
- [ ] OpenAPI / Swagger UI konfigürasyonu
- [ ] CI/CD: GitHub Actions (build + test)

### Frontend
- [ ] Vite + React + TypeScript projesi oluştur
- [ ] Tailwind CSS konfigürasyonu
- [ ] shadcn/ui kurulumu (components.json)
- [ ] React Router v6 kurulumu ve temel route yapısı
- [ ] Axios API client (`api/client.ts`)
- [ ] TanStack Query kurulumu (QueryClient + devtools)
- [ ] Zustand kurulumu
- [ ] Temel layout bileşenleri (Header, Footer)
- [ ] `.env.example` ve ortam değişkenleri

---

## Sprint 1 — Kimlik Doğrulama & Kullanıcı (Hafta 3-4)

### Backend
- [ ] V1 migration: `users`, `refresh_tokens`, `email_verification_tokens`
- [ ] `User` entity + `UserRepository`
- [ ] `AuthService`: register, login, refresh, logout
- [ ] `JwtService`: token üret / doğrula
- [ ] `JwtAuthenticationFilter`
- [ ] `SecurityConfig` (public/protected paths)
- [ ] `RefreshToken` rotation mantığı
- [ ] E-posta doğrulama token akışı
- [ ] Şifre sıfırlama akışı
- [ ] Bean Validation: `RegisterRequest`, `LoginRequest`
- [ ] `UserController` (profil CRUD)
- [ ] V migration: `addresses` tablosu
- [ ] `AddressService` + `AddressController`
- [ ] Unit test: AuthService, JwtService
- [ ] Entegrasyon test: /auth/register, /auth/login

### Frontend
- [ ] `auth.store.ts` (Zustand — accessToken, user)
- [ ] `LoginPage.tsx` + `LoginForm.tsx` (RHF + Zod)
- [ ] `RegisterPage.tsx` + `RegisterForm.tsx`
- [ ] `ForgotPasswordPage.tsx`
- [ ] `ProtectedRoute.tsx` bileşeni
- [ ] Token refresh interceptor (Axios)
- [ ] `useAuth.ts` hook
- [ ] `ProfilePage.tsx` (adres CRUD dahil)

---

## Sprint 2 — Katalog: Kategori & Ürün (Hafta 5-6)

### Backend
- [ ] V2 migration: `categories`, `colors`, `sizes`, `products`,
      `product_variants`, `product_images`, `product_tags`, `product_attributes`
- [ ] `Category` entity + repository + service + controller
- [ ] `Product` entity (search_vector tsvector, tüm kolonlar)
- [ ] PostgreSQL trigger: `update_product_search_vector`
- [ ] `ProductVariant`, `ProductImage` entity'leri
- [ ] `ProductRepository` (JPQL + Spring Specification)
- [ ] `ProductSpecification` (filtre: kategori, renk, beden, fiyat, tag, arama)
- [ ] `ProductService` (listeleme, detay, arama)
- [ ] `ProductController` (public)
- [ ] `AdminProductController` (CRUD + durum değiştirme)
- [ ] `AdminCategoryController`
- [ ] `ProductMapper` (MapStruct — entity → DTO)
- [ ] V seed migration: renk ve beden master verileri
- [ ] Entegrasyon testi: ürün filtreleme

### Frontend
- [ ] `catalog.api.ts` + `useProducts.ts` + `useProduct.ts` hooks
- [ ] `ProductCard.tsx` + `ProductCardSkeleton.tsx`
- [ ] `ProductListPage.tsx` (grid, sayfalama)
- [ ] `FilterSidebar.tsx` (kategori, renk, beden, fiyat)
- [ ] `ProductDetailPage.tsx` (galeri, varyant seçimi, stok)
- [ ] `ImageGallery.tsx` (thumbnail + ana görsel)
- [ ] `ColorSwatch.tsx` + `SizeSelector.tsx`
- [ ] `HomePage.tsx` (öne çıkanlar, yeni gelenler)
- [ ] `SearchPage.tsx` (arama sonuçları)
- [ ] SEO: Helmet entegrasyonu

---

## Sprint 3 — Görsel Yükleme & Depolama (Hafta 7)

### Backend
- [ ] `StorageService` interface
- [ ] `CloudflareR2StorageAdapter` (AWS SDK v2 S3 uyumlu)
- [ ] Görsel yükleme endpoint'i (multipart/form-data)
- [ ] Görsel silme endpoint'i
- [ ] Görsel sıralama güncelleme
- [ ] Dosya tipi ve boyut validasyonu
- [ ] Presigned URL üretimi (güvenli okuma)

### Frontend
- [ ] `ImageUploader.tsx` (drag-drop + preview)
- [ ] Admin ürün formu görsel yönetimi

---

## Sprint 4 — Sepet & Kupon (Hafta 8-9)

### Backend
- [ ] V3 migration: `carts`, `cart_items`, `coupons`
- [ ] `Cart`, `CartItem` entity + repository
- [ ] `CartService` (ekle, güncelle, sil, temizle, birleştirme)
- [ ] `CartController`
- [ ] `Coupon` entity + `CouponService` (doğrulama mantığı)
- [ ] `AdminCouponController`
- [ ] Guest sepet: session_id header yönetimi
- [ ] Stok soft check (sepete eklerken)
- [ ] Entegrasyon testi: kupon validasyonu, sepet merge

### Frontend
- [ ] `cart.store.ts` (misafir sepeti localStorage)
- [ ] `CartDrawer.tsx` (slide-over)
- [ ] `CartPage.tsx`
- [ ] `CartItem.tsx` (miktar artır/azalt, sil)
- [ ] `CartSummary.tsx` (kupon input dahil)
- [ ] `useCart.ts` hook (TanStack Query mutasyonları)
- [ ] Sepet merge (login sonrası)

---

## Sprint 5 — Ödeme, Sipariş & Checkout (Hafta 10-11)

### Backend
- [ ] V4 migration: `orders`, `order_items`, `order_status_history`
- [ ] V5 migration: `payments`, `shipments`
- [ ] `Order`, `OrderItem`, `OrderStatusHistory` entity
- [ ] `OrderService` (oluşturma, durum geçişi, iptal)
- [ ] `OrderNumberGenerator` (NY-YYYYMMDD-XXXXX)
- [ ] `PaymentService` interface + `MockPaymentAdapter`
- [ ] `PaymentFacade` (provider seçici)
- [ ] `Payment` entity + repository
- [ ] `ShipmentService` interface + `MockShipmentAdapter`
- [ ] `MockShipmentAdapter`: `@Scheduled` durum simülasyonu
- [ ] `OrderPaidEvent` + listener'lar (stok, kargo, bildirim)
- [ ] `OrderController` + `AdminOrderController`
- [ ] `OrderMapper` (MapStruct)
- [ ] Entegrasyon testi: tam checkout akışı

### Frontend
- [ ] `CheckoutPage.tsx` (adım adım: adres → ödeme → özet)
- [ ] `CheckoutAddress.tsx`
- [ ] `CheckoutPayment.tsx` (simülasyon butonu)
- [ ] `OrderSuccessPage.tsx`
- [ ] `OrdersPage.tsx` (liste)
- [ ] `OrderDetailPage.tsx` (kargo takip dahil)
- [ ] `checkout.schema.ts` (Zod)

---

## Sprint 6 — İade, Bildirim & Favori (Hafta 12-13)

### Backend
- [ ] V6 migration: `returns`, `return_items`
- [ ] `Return`, `ReturnItem` entity + repository
- [ ] `ReturnService` (talep, onay, red, teslim alma)
- [ ] `ReturnController` + `AdminReturnController`
- [ ] V8 migration: `wishlist`
- [ ] `WishlistService` + `WishlistController`
- [ ] V9 migration: `notification_logs`
- [ ] `NotificationService` interface + `ResendEmailAdapter`
- [ ] Thymeleaf e-posta şablonları (tüm tetikleyiciler)
- [ ] `NotificationFacade` + event listener'lar
- [ ] Entegrasyon testi: iade akışı

### Frontend
- [ ] `WishlistPage.tsx` + wishlist toggle (ProductCard entegrasyonu)
- [ ] `ReturnsPage.tsx` (iade talep formu + liste)
- [ ] `useWishlist.ts` hook
- [ ] Toast bildirimleri (shadcn/ui Sonner)

---

## Sprint 7 — Admin Paneli (Hafta 14-15)

### Backend
- [ ] `DashboardService` (günlük satış, sipariş sayısı, top 5 ürün, düşük stok)
- [ ] `ReportService` (tarih aralıklı satış, CSV export)
- [ ] `AdminDashboardController`
- [ ] `AdminCustomerController` (liste, detay, aktif/pasif)
- [ ] `AdminReportController`
- [ ] Düşük stok e-posta uyarısı (`@Scheduled` her sabah 09:00)

### Frontend
- [ ] `AdminLayout.tsx` (sidebar nav, breadcrumb)
- [ ] `DashboardPage.tsx` (StatCard, satış grafiği, son siparişler)
- [ ] `AdminProductListPage.tsx` (DataTable, filtre, arama)
- [ ] `ProductFormPage.tsx` (oluştur/düzenle, varyant yönetimi)
- [ ] `AdminOrderListPage.tsx` + `AdminOrderDetailPage.tsx`
- [ ] `AdminReturnListPage.tsx` + `AdminReturnDetailPage.tsx`
- [ ] `CouponPage.tsx`
- [ ] `CustomerListPage.tsx`
- [ ] `ReportsPage.tsx` (grafik + CSV export)
- [ ] `DataTable.tsx` (TanStack Table wrapper)

---

## Sprint 8 — Güvenlik Sıkılaştırma, SEO & Launch Hazırlığı (Hafta 16)

### Backend
- [ ] Rate limiting tam konfigürasyonu (tüm endpoint grupları)
- [ ] Güvenlik HTTP başlıkları
- [ ] Log maskeleme (e-posta, şifre)
- [ ] Actuator: sadece health/info prod'da açık
- [ ] Dependency vulnerability check (OWASP)
- [ ] Sitemap.xml endpoint
- [ ] robots.txt
- [ ] Performans: N+1 query analizi, gerekli `@EntityGraph` eklemeleri
- [ ] Docker image optimizasyonu (multi-stage build)

### Frontend
- [ ] React Helmet tüm sayfalarda
- [ ] Open Graph meta tag'leri
- [ ] Lighthouse CI (Core Web Vitals kontrolü)
- [ ] Erişilebilirlik auditi (axe DevTools)
- [ ] Çerez onay banner (KVKK)
- [ ] 404 / 500 hata sayfaları
- [ ] Skeleton loading tüm listeler
- [ ] Mobile responsive son kontrol

---

## Faz Özeti

| Faz    | Sprint     | Temel Çıktı                                    |
|--------|------------|------------------------------------------------|
| Faz 1  | Sprint 0-1 | Altyapı + Auth                                 |
| Faz 2  | Sprint 2-3 | Ürün kataloğu + Görsel yönetimi               |
| Faz 3  | Sprint 4-5 | Sepet + Checkout + Ödeme simülasyonu          |
| Faz 4  | Sprint 6   | İade + Bildirim + Favori                       |
| Faz 5  | Sprint 7   | Admin paneli                                   |
| Faz 6  | Sprint 8   | Güvenlik + SEO + Launch                        |
