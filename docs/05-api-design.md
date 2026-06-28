# Ny Butik — API Tasarımı

## 1. Genel Kurallar

- Base URL: `https://api.nybutik.com/api/v1`
- Format: JSON (Content-Type: application/json)
- Kimlik doğrulama: `Authorization: Bearer <access_token>`
- Tüm yanıtlar standart zarf kullanır (aşağıya bakın)
- Hata yanıtları RFC 7807 (Problem Details) uyumlu
- Sayfalama: `?page=0&size=20&sort=createdAt,desc`
- OpenAPI 3.0 spec otomatik üretilir: `/swagger-ui.html`

---

## 2. Standart Yanıt Formatı

```json
// Başarı — tekil kayıt
{
  "data": { ... },
  "timestamp": "2026-06-28T10:00:00Z"
}

// Başarı — sayfalı liste
{
  "data": {
    "content": [ ... ],
    "page": 0,
    "size": 20,
    "totalElements": 150,
    "totalPages": 8,
    "last": false
  },
  "timestamp": "2026-06-28T10:00:00Z"
}

// Hata (RFC 7807)
{
  "type": "https://api.nybutik.com/errors/validation",
  "title": "Validation Failed",
  "status": 422,
  "detail": "İstek verileri geçersiz.",
  "instance": "/api/v1/auth/register",
  "errors": [
    { "field": "email", "message": "Geçerli bir e-posta adresi giriniz." }
  ],
  "traceId": "abc123"
}
```

---

## 3. Kimlik Doğrulama Endpoint'leri

```
POST   /auth/register          → Kayıt (GUEST)
POST   /auth/login             → Giriş, access + refresh token döner
POST   /auth/refresh           → Access token yenileme (refresh cookie'den)
POST   /auth/logout            → Refresh token iptal et
POST   /auth/verify-email      → E-posta doğrulama (token ile)
POST   /auth/forgot-password   → Şifre sıfırlama isteği
POST   /auth/reset-password    → Yeni şifre belirleme (token ile)
```

### POST /auth/register
```json
// Request
{
  "firstName": "Ayşe",
  "lastName": "Demir",
  "email": "ayse@example.com",
  "password": "Guclu_Sifre123!"
}
// Response 201
{
  "data": {
    "id": 42,
    "email": "ayse@example.com",
    "firstName": "Ayşe",
    "message": "Kayıt başarılı. E-postanızı doğrulayın."
  }
}
```

### POST /auth/login
```json
// Request
{ "email": "ayse@example.com", "password": "..." }
// Response 200
// HttpOnly cookie: refresh_token=<jwt>; Path=/api/v1/auth/refresh; SameSite=Strict
{
  "data": {
    "accessToken": "<jwt>",
    "expiresIn": 900,
    "user": { "id": 42, "email": "...", "firstName": "Ayşe", "role": "CUSTOMER" }
  }
}
```

---

## 4. Kullanıcı Endpoint'leri

```
GET    /users/me               → Profil bilgisi (CUSTOMER)
PUT    /users/me               → Profil güncelleme (CUSTOMER)
PUT    /users/me/password      → Şifre değiştirme (CUSTOMER)
DELETE /users/me               → Hesap silme talebi (CUSTOMER)

GET    /users/me/addresses     → Adres listesi (CUSTOMER)
POST   /users/me/addresses     → Yeni adres ekle (CUSTOMER)
PUT    /users/me/addresses/{id}→ Adres güncelle (CUSTOMER)
DELETE /users/me/addresses/{id}→ Adres sil (CUSTOMER)
PATCH  /users/me/addresses/{id}/default → Varsayılan yap (CUSTOMER)
```

---

## 5. Katalog Endpoint'leri (Public)

```
GET    /categories             → Kategori ağacı
GET    /categories/{slug}      → Kategori detayı

GET    /products               → Ürün listesi (filtrelenmiş, sayfalı)
GET    /products/{slug}        → Ürün detayı (varyantlar, görseller dahil)
GET    /products/search?q=abiye→ Tam metin arama
GET    /products/featured      → Öne çıkan ürünler
GET    /products/new-arrivals  → Yeni gelenler
```

### GET /products Query Parametreleri
```
?category={slug}       - Kategori filtresi
?color={id,...}        - Renk filtresi (çoklu)
?size={id,...}         - Beden filtresi (çoklu)
?minPrice=100          - Minimum fiyat
?maxPrice=500          - Maksimum fiyat
?onSale=true           - Sadece indirimli
?tag={tag}             - Etiket filtresi
?sort=price_asc|price_desc|newest|popular
?page=0&size=24
```

### GET /products/{slug} Response (tam)
```json
{
  "data": {
    "id": 1,
    "name": "Siyah Krep Elbise",
    "slug": "siyah-krep-elbise",
    "shortDesc": "...",
    "description": "<rich-text>",
    "category": { "id": 3, "name": "Elbise", "slug": "elbise" },
    "tags": ["yeni-sezon", "abiye"],
    "attributes": [
      { "key": "Kumaş", "value": "Krep" },
      { "key": "Kalıp", "value": "Regular Fit" }
    ],
    "variants": [
      {
        "id": 10,
        "sku": "NYB-SYH-KRP-S",
        "color": { "id": 1, "name": "Siyah", "hexCode": "#000000" },
        "size": { "id": 2, "name": "S" },
        "price": 599.90,
        "salePrice": 479.90,
        "stockQuantity": 15,
        "isActive": true
      }
    ],
    "images": [
      { "id": 1, "url": "https://r2.nybutik.com/...", "altText": "...", "isPrimary": true, "variantId": null }
    ],
    "status": "ACTIVE",
    "featured": false
  }
}
```

---

## 6. Favori Endpoint'leri (Customer)

```
GET    /wishlist               → Favori listesi
POST   /wishlist/{productId}   → Favoriye ekle
DELETE /wishlist/{productId}   → Favoriden çıkar
```

---

## 7. Sepet Endpoint'leri

```
GET    /cart                   → Sepet içeriği (Guest: session_id header, Customer: JWT)
POST   /cart/items             → Ürün ekle
PUT    /cart/items/{variantId} → Miktar güncelle
DELETE /cart/items/{variantId} → Ürün çıkar
DELETE /cart                   → Sepeti temizle
POST   /cart/coupon            → Kupon uygula
DELETE /cart/coupon            → Kuponu kaldır
POST   /cart/merge             → Guest sepetle müşteri sepetini birleştir (login sonrası)
```

### POST /cart/items
```json
// Request
{ "variantId": 10, "quantity": 2 }
// Response 200 — tam sepet özeti döner
{
  "data": {
    "items": [...],
    "subtotal": 959.80,
    "discountAmount": 0,
    "shippingAmount": 49.90,
    "total": 1009.70,
    "coupon": null
  }
}
```

---

## 8. Sipariş Endpoint'leri

```
GET    /orders                 → Sipariş geçmişi (Customer, sayfalı)
GET    /orders/{orderNumber}   → Sipariş detayı (Customer/Admin)
POST   /orders                 → Sipariş oluştur & ödeme başlat (Customer)
POST   /orders/{id}/cancel     → İptal talebi (Customer — belirli statuslarda)
GET    /orders/{id}/shipment   → Kargo takip bilgisi (Customer)
```

### POST /orders (Checkout)
```json
// Request
{
  "shippingAddressId": 5,
  "billingAddressId": 5,
  "paymentMethod": "MOCK",
  "notes": "Zili çalabilirsiniz."
}
// Response 201
{
  "data": {
    "orderId": 101,
    "orderNumber": "NY-20260628-00001",
    "status": "PAYMENT_PROCESSING",
    "paymentRedirectUrl": null,   // gerçek provider için redirect URL
    "total": 1009.70
  }
}
```

---

## 9. İade Endpoint'leri

```
POST   /returns                → İade talebi aç (Customer)
GET    /returns                → İade taleplerim (Customer)
GET    /returns/{id}           → İade detayı (Customer/Admin)
```

---

## 10. Admin Endpoint'leri

Tüm admin endpoint'leri `/admin` prefix'i taşır ve `ROLE_ADMIN` gerektirir.

### Ürün Yönetimi
```
GET    /admin/products         → Sayfalı liste (DRAFT dahil)
POST   /admin/products         → Yeni ürün oluştur
GET    /admin/products/{id}    → Detay
PUT    /admin/products/{id}    → Güncelle
PATCH  /admin/products/{id}/status → Durum değiştir (ACTIVE/ARCHIVED)
DELETE /admin/products/{id}    → Soft delete

POST   /admin/products/{id}/images       → Görsel yükle
DELETE /admin/products/{id}/images/{imgId} → Görsel sil
PATCH  /admin/products/{id}/images/reorder → Sıralama güncelle

POST   /admin/products/{id}/variants     → Varyant ekle
PUT    /admin/products/{id}/variants/{vid}  → Varyant güncelle
PATCH  /admin/products/{id}/variants/{vid}/stock → Stok güncelle
```

### Kategori Yönetimi
```
GET    /admin/categories       → Tüm kategoriler (ağaç)
POST   /admin/categories       → Yeni kategori
PUT    /admin/categories/{id}  → Güncelle
DELETE /admin/categories/{id}  → Sil (alt kategorisi yoksa)
```

### Sipariş Yönetimi
```
GET    /admin/orders           → Sayfalı sipariş listesi (filtre: status, tarih)
GET    /admin/orders/{id}      → Detay
PATCH  /admin/orders/{id}/status → Durum güncelle (PREPARING → SHIPPED vb.)
```

### İade Yönetimi
```
GET    /admin/returns          → İade talepleri (filtre: status)
GET    /admin/returns/{id}     → Detay
PATCH  /admin/returns/{id}/approve → Onayla
PATCH  /admin/returns/{id}/reject  → Reddet (sebep zorunlu)
PATCH  /admin/returns/{id}/received → Ürün teslim alındı
```

### Kupon Yönetimi
```
GET    /admin/coupons          → Kupon listesi
POST   /admin/coupons          → Yeni kupon
PUT    /admin/coupons/{id}     → Güncelle
PATCH  /admin/coupons/{id}/toggle → Aktif/pasif
```

### Müşteri Yönetimi
```
GET    /admin/customers        → Müşteri listesi (arama: email, isim)
GET    /admin/customers/{id}   → Detay (sipariş geçmişi dahil)
PATCH  /admin/customers/{id}/toggle → Hesap aktif/pasif
```

### Raporlar
```
GET    /admin/reports/sales    → Satış özeti (?from=2026-01&to=2026-06)
GET    /admin/reports/top-products → En çok satan ürünler
GET    /admin/reports/low-stock   → Düşük stok uyarısı (threshold query param)
GET    /admin/reports/export   → CSV export (sales)
```

### Dashboard
```
GET    /admin/dashboard        → Tüm widget verileri (tek endpoint)
```

---

## 11. HTTP Durum Kodları

| Kod | Kullanım                                      |
|-----|-----------------------------------------------|
| 200 | Başarılı GET/PUT/PATCH                        |
| 201 | Başarılı POST (kayıt oluşturuldu)             |
| 204 | Başarılı DELETE (içerik yok)                  |
| 400 | Geçersiz istek (format hatası)                |
| 401 | Kimlik doğrulanmamış                          |
| 403 | Yetki yetersiz                                |
| 404 | Kaynak bulunamadı                             |
| 409 | Çakışma (ör. e-posta zaten kayıtlı)           |
| 422 | Validasyon hatası                             |
| 429 | Rate limit aşıldı                             |
| 500 | Sunucu hatası                                 |

---

## 12. Rate Limiting

| Endpoint Grubu          | Limit                  |
|-------------------------|------------------------|
| POST /auth/login        | 10 istek / dakika / IP |
| POST /auth/register     | 5 istek / saat / IP    |
| GET /products/**        | 200 istek / dakika     |
| POST /orders            | 10 istek / dakika / kullanıcı |
| Admin endpoint'leri     | 100 istek / dakika     |

Uygulama: Bucket4j (Spring Boot starter)
