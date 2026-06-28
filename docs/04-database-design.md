# Ny Butik — Veritabanı Tasarımı

## 1. Genel İlkeler

- Tüm tablolar `id BIGSERIAL PRIMARY KEY` kullanır
- Her kayıt `created_at`, `updated_at` taşır (Hibernate `@CreationTimestamp` / `@UpdateTimestamp`)
- Soft delete: `deleted_at TIMESTAMP` — fiziksel silme yok (ürün/sipariş için kritik)
- PostgreSQL şema ayrımı: `public` (tek şema, başlangıç için yeterli; büyüyünce `catalog`, `orders`, `users` şemalarına taşınabilir)
- Tüm string kolonlar `VARCHAR` ile kısıtlı; sınırsız `TEXT` yalnızca açıklamalar için
- Enum değerler `VARCHAR(50)` olarak saklanır (Java enum sınıf adı); tablo yoktur

---

## 2. Şema Diyagramı (Tam)

### 2.1 Kullanıcı & Adres

```sql
users
─────────────────────────────────────────────────────────────────────────
id              BIGSERIAL PK
email           VARCHAR(255) UNIQUE NOT NULL
password_hash   VARCHAR(255) NOT NULL
first_name      VARCHAR(100) NOT NULL
last_name       VARCHAR(100) NOT NULL
phone           VARCHAR(20)
role            VARCHAR(20) NOT NULL DEFAULT 'CUSTOMER'  -- GUEST|CUSTOMER|ADMIN
email_verified  BOOLEAN NOT NULL DEFAULT false
is_active       BOOLEAN NOT NULL DEFAULT true
created_at      TIMESTAMP NOT NULL DEFAULT now()
updated_at      TIMESTAMP NOT NULL DEFAULT now()

refresh_tokens
─────────────────────────────────────────────────────────────────────────
id              BIGSERIAL PK
user_id         BIGINT FK → users.id NOT NULL
token_hash      VARCHAR(255) UNIQUE NOT NULL   -- SHA-256 hash of actual token
expires_at      TIMESTAMP NOT NULL
revoked         BOOLEAN NOT NULL DEFAULT false
created_at      TIMESTAMP NOT NULL DEFAULT now()

INDEX: (user_id), (token_hash)

email_verification_tokens
─────────────────────────────────────────────────────────────────────────
id              BIGSERIAL PK
user_id         BIGINT FK → users.id NOT NULL
token           VARCHAR(255) UNIQUE NOT NULL
expires_at      TIMESTAMP NOT NULL
used            BOOLEAN NOT NULL DEFAULT false
created_at      TIMESTAMP NOT NULL DEFAULT now()

addresses
─────────────────────────────────────────────────────────────────────────
id              BIGSERIAL PK
user_id         BIGINT FK → users.id NOT NULL
label           VARCHAR(100)           -- "Ev", "İş" gibi
first_name      VARCHAR(100) NOT NULL
last_name       VARCHAR(100) NOT NULL
phone           VARCHAR(20) NOT NULL
address_line1   VARCHAR(255) NOT NULL
address_line2   VARCHAR(255)
city            VARCHAR(100) NOT NULL
district        VARCHAR(100) NOT NULL
postal_code     VARCHAR(10) NOT NULL
country         VARCHAR(2) NOT NULL DEFAULT 'TR'
is_default      BOOLEAN NOT NULL DEFAULT false
created_at      TIMESTAMP NOT NULL DEFAULT now()
updated_at      TIMESTAMP NOT NULL DEFAULT now()
```

### 2.2 Katalog

```sql
categories
─────────────────────────────────────────────────────────────────────────
id              BIGSERIAL PK
parent_id       BIGINT FK → categories.id    -- NULL = kök kategori
name            VARCHAR(150) NOT NULL
slug            VARCHAR(150) UNIQUE NOT NULL
description     TEXT
image_url       VARCHAR(500)
display_order   INTEGER NOT NULL DEFAULT 0
is_active       BOOLEAN NOT NULL DEFAULT true
created_at      TIMESTAMP NOT NULL DEFAULT now()
updated_at      TIMESTAMP NOT NULL DEFAULT now()

INDEX: (parent_id), (slug), (is_active)

products
─────────────────────────────────────────────────────────────────────────
id              BIGSERIAL PK
category_id     BIGINT FK → categories.id NOT NULL
name            VARCHAR(300) NOT NULL
slug            VARCHAR(300) UNIQUE NOT NULL
short_desc      VARCHAR(500)
description     TEXT
status          VARCHAR(20) NOT NULL DEFAULT 'DRAFT'  -- DRAFT|ACTIVE|ARCHIVED
featured        BOOLEAN NOT NULL DEFAULT false
search_vector   TSVECTOR             -- tam metin arama için (trigger ile güncellenir)
created_at      TIMESTAMP NOT NULL DEFAULT now()
updated_at      TIMESTAMP NOT NULL DEFAULT now()
deleted_at      TIMESTAMP

INDEX: (category_id), (status), (slug), GIN(search_vector)

product_tags
─────────────────────────────────────────────────────────────────────────
id              BIGSERIAL PK
product_id      BIGINT FK → products.id NOT NULL
tag             VARCHAR(100) NOT NULL
UNIQUE(product_id, tag)

product_attributes
─────────────────────────────────────────────────────────────────────────
id              BIGSERIAL PK
product_id      BIGINT FK → products.id NOT NULL
attr_key        VARCHAR(100) NOT NULL   -- "Kumaş", "Kalıp" gibi
attr_value      VARCHAR(255) NOT NULL
display_order   INTEGER NOT NULL DEFAULT 0
UNIQUE(product_id, attr_key)

colors
─────────────────────────────────────────────────────────────────────────
id              BIGSERIAL PK
name            VARCHAR(100) NOT NULL   -- "Siyah", "Ekru"
hex_code        VARCHAR(7)              -- "#000000"
slug            VARCHAR(100) UNIQUE NOT NULL

sizes
─────────────────────────────────────────────────────────────────────────
id              BIGSERIAL PK
name            VARCHAR(50) NOT NULL    -- "S", "M", "XL", "38", "40"
size_group      VARCHAR(50)             -- "ALPHA" | "NUMERIC"
sort_order      INTEGER NOT NULL DEFAULT 0
UNIQUE(name)

product_variants
─────────────────────────────────────────────────────────────────────────
id              BIGSERIAL PK
product_id      BIGINT FK → products.id NOT NULL
color_id        BIGINT FK → colors.id
size_id         BIGINT FK → sizes.id
sku             VARCHAR(100) UNIQUE NOT NULL
price           NUMERIC(12,2) NOT NULL
sale_price      NUMERIC(12,2)          -- NULL ise indirim yok
stock_quantity  INTEGER NOT NULL DEFAULT 0
is_active       BOOLEAN NOT NULL DEFAULT true
created_at      TIMESTAMP NOT NULL DEFAULT now()
updated_at      TIMESTAMP NOT NULL DEFAULT now()

UNIQUE(product_id, color_id, size_id)
INDEX: (product_id), (sku), (stock_quantity)

product_images
─────────────────────────────────────────────────────────────────────────
id              BIGSERIAL PK
product_id      BIGINT FK → products.id NOT NULL
variant_id      BIGINT FK → product_variants.id  -- NULL = tüm ürün için
url             VARCHAR(500) NOT NULL
alt_text        VARCHAR(255)
display_order   INTEGER NOT NULL DEFAULT 0
is_primary      BOOLEAN NOT NULL DEFAULT false
created_at      TIMESTAMP NOT NULL DEFAULT now()

INDEX: (product_id), (variant_id)
```

### 2.3 Favori & Sepet

```sql
wishlists
─────────────────────────────────────────────────────────────────────────
id              BIGSERIAL PK
user_id         BIGINT FK → users.id NOT NULL
product_id      BIGINT FK → products.id NOT NULL
created_at      TIMESTAMP NOT NULL DEFAULT now()
UNIQUE(user_id, product_id)

carts
─────────────────────────────────────────────────────────────────────────
id              BIGSERIAL PK
user_id         BIGINT FK → users.id  -- NULL = misafir sepeti
session_id      VARCHAR(100)           -- misafir için
coupon_id       BIGINT FK → coupons.id
created_at      TIMESTAMP NOT NULL DEFAULT now()
updated_at      TIMESTAMP NOT NULL DEFAULT now()

INDEX: (user_id), (session_id)

cart_items
─────────────────────────────────────────────────────────────────────────
id              BIGSERIAL PK
cart_id         BIGINT FK → carts.id NOT NULL ON DELETE CASCADE
variant_id      BIGINT FK → product_variants.id NOT NULL
quantity        INTEGER NOT NULL CHECK (quantity > 0)
unit_price      NUMERIC(12,2) NOT NULL  -- anlık fiyat snapshot
created_at      TIMESTAMP NOT NULL DEFAULT now()
updated_at      TIMESTAMP NOT NULL DEFAULT now()
UNIQUE(cart_id, variant_id)
```

### 2.4 Kupon

```sql
coupons
─────────────────────────────────────────────────────────────────────────
id              BIGSERIAL PK
code            VARCHAR(50) UNIQUE NOT NULL
discount_type   VARCHAR(20) NOT NULL   -- PERCENTAGE | FIXED_AMOUNT
discount_value  NUMERIC(10,2) NOT NULL
min_order_amount NUMERIC(12,2)
max_uses        INTEGER                -- NULL = sınırsız
uses_per_user   INTEGER NOT NULL DEFAULT 1
used_count      INTEGER NOT NULL DEFAULT 0
is_active       BOOLEAN NOT NULL DEFAULT true
starts_at       TIMESTAMP
expires_at      TIMESTAMP
created_at      TIMESTAMP NOT NULL DEFAULT now()
updated_at      TIMESTAMP NOT NULL DEFAULT now()
```

### 2.5 Sipariş

```sql
orders
─────────────────────────────────────────────────────────────────────────
id              BIGSERIAL PK
order_number    VARCHAR(30) UNIQUE NOT NULL  -- NY-20260628-00001
user_id         BIGINT FK → users.id NOT NULL
status          VARCHAR(30) NOT NULL DEFAULT 'PENDING_PAYMENT'
coupon_id       BIGINT FK → coupons.id
subtotal        NUMERIC(12,2) NOT NULL
discount_amount NUMERIC(12,2) NOT NULL DEFAULT 0
shipping_amount NUMERIC(12,2) NOT NULL DEFAULT 0
tax_amount      NUMERIC(12,2) NOT NULL DEFAULT 0
total_amount    NUMERIC(12,2) NOT NULL
notes           TEXT

-- Adres snapshot'ları (sipariş sırasındaki anlık kopya)
shipping_name       VARCHAR(200) NOT NULL
shipping_phone      VARCHAR(20) NOT NULL
shipping_address1   VARCHAR(255) NOT NULL
shipping_address2   VARCHAR(255)
shipping_city       VARCHAR(100) NOT NULL
shipping_district   VARCHAR(100) NOT NULL
shipping_postal     VARCHAR(10) NOT NULL
shipping_country    VARCHAR(2) NOT NULL DEFAULT 'TR'

billing_name        VARCHAR(200) NOT NULL
billing_phone       VARCHAR(20) NOT NULL
billing_address1    VARCHAR(255) NOT NULL
billing_address2    VARCHAR(255)
billing_city        VARCHAR(100) NOT NULL
billing_district    VARCHAR(100) NOT NULL
billing_postal      VARCHAR(10) NOT NULL
billing_country     VARCHAR(2) NOT NULL DEFAULT 'TR'

created_at      TIMESTAMP NOT NULL DEFAULT now()
updated_at      TIMESTAMP NOT NULL DEFAULT now()

INDEX: (user_id), (status), (order_number), (created_at DESC)

order_items
─────────────────────────────────────────────────────────────────────────
id              BIGSERIAL PK
order_id        BIGINT FK → orders.id NOT NULL
variant_id      BIGINT FK → product_variants.id NOT NULL
product_name    VARCHAR(300) NOT NULL    -- snapshot
sku             VARCHAR(100) NOT NULL    -- snapshot
color_name      VARCHAR(100)             -- snapshot
size_name       VARCHAR(50)              -- snapshot
image_url       VARCHAR(500)             -- snapshot
quantity        INTEGER NOT NULL
unit_price      NUMERIC(12,2) NOT NULL
sale_price      NUMERIC(12,2)
line_total      NUMERIC(12,2) NOT NULL

order_status_history
─────────────────────────────────────────────────────────────────────────
id              BIGSERIAL PK
order_id        BIGINT FK → orders.id NOT NULL
status          VARCHAR(30) NOT NULL
note            TEXT
changed_by      BIGINT FK → users.id   -- NULL = sistem
created_at      TIMESTAMP NOT NULL DEFAULT now()

INDEX: (order_id, created_at DESC)
```

### 2.6 Ödeme & Kargo

```sql
payments
─────────────────────────────────────────────────────────────────────────
id              BIGSERIAL PK
order_id        BIGINT FK → orders.id NOT NULL
provider        VARCHAR(50) NOT NULL   -- MOCK | IYZICO | STRIPE
provider_ref    VARCHAR(255)           -- sağlayıcı referans no
amount          NUMERIC(12,2) NOT NULL
currency        VARCHAR(3) NOT NULL DEFAULT 'TRY'
status          VARCHAR(30) NOT NULL   -- PENDING | SUCCESS | FAILED | REFUNDED
error_code      VARCHAR(100)
error_message   TEXT
initiated_at    TIMESTAMP NOT NULL DEFAULT now()
completed_at    TIMESTAMP
created_at      TIMESTAMP NOT NULL DEFAULT now()
updated_at      TIMESTAMP NOT NULL DEFAULT now()

INDEX: (order_id), (provider_ref)

shipments
─────────────────────────────────────────────────────────────────────────
id              BIGSERIAL PK
order_id        BIGINT FK → orders.id NOT NULL
provider        VARCHAR(50) NOT NULL   -- MOCK | YURTICI | MNG
tracking_number VARCHAR(100)
tracking_url    VARCHAR(500)
status          VARCHAR(30) NOT NULL   -- CREATED | PICKED_UP | IN_TRANSIT | DELIVERED | RETURNED
estimated_delivery TIMESTAMP
delivered_at    TIMESTAMP
created_at      TIMESTAMP NOT NULL DEFAULT now()
updated_at      TIMESTAMP NOT NULL DEFAULT now()

INDEX: (order_id), (tracking_number)
```

### 2.7 İade

```sql
returns
─────────────────────────────────────────────────────────────────────────
id              BIGSERIAL PK
order_id        BIGINT FK → orders.id NOT NULL
user_id         BIGINT FK → users.id NOT NULL
status          VARCHAR(30) NOT NULL DEFAULT 'REQUESTED'
reason          VARCHAR(50) NOT NULL   -- DEFECTIVE | WRONG_ITEM | CHANGED_MIND | OTHER
description     TEXT
admin_note      TEXT
return_tracking VARCHAR(100)
refund_amount   NUMERIC(12,2)
created_at      TIMESTAMP NOT NULL DEFAULT now()
updated_at      TIMESTAMP NOT NULL DEFAULT now()

return_items
─────────────────────────────────────────────────────────────────────────
id              BIGSERIAL PK
return_id       BIGINT FK → returns.id NOT NULL ON DELETE CASCADE
order_item_id   BIGINT FK → order_items.id NOT NULL
quantity        INTEGER NOT NULL
```

### 2.8 Bildirim

```sql
notification_logs
─────────────────────────────────────────────────────────────────────────
id              BIGSERIAL PK
user_id         BIGINT FK → users.id
channel         VARCHAR(20) NOT NULL   -- EMAIL | SMS | PUSH
type            VARCHAR(50) NOT NULL   -- ORDER_CONFIRMED | SHIPPED | etc.
recipient       VARCHAR(255) NOT NULL
subject         VARCHAR(255)
status          VARCHAR(20) NOT NULL   -- PENDING | SENT | FAILED
provider_ref    VARCHAR(255)
error           TEXT
created_at      TIMESTAMP NOT NULL DEFAULT now()
sent_at         TIMESTAMP
```

---

## 3. PostgreSQL Tam Metin Arama Trigger

```sql
-- products.search_vector güncel tutmak için
CREATE FUNCTION update_product_search_vector() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('turkish', coalesce(NEW.name, '')), 'A') ||
    setweight(to_tsvector('turkish', coalesce(NEW.short_desc, '')), 'B') ||
    setweight(to_tsvector('turkish', coalesce(NEW.description, '')), 'C');
  RETURN NEW;
END
$$ LANGUAGE plpgsql;

CREATE TRIGGER products_search_vector_update
  BEFORE INSERT OR UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_product_search_vector();
```

---

## 4. Temel İndeks Stratejisi

| Tablo           | İndeks                                    | Gerekçe                    |
|-----------------|-------------------------------------------|----------------------------|
| products        | GIN(search_vector)                        | Tam metin arama            |
| products        | (category_id, status)                     | Kategori filtreleme        |
| product_variants| (product_id, is_active)                   | Aktif varyant listesi      |
| orders          | (user_id, created_at DESC)                | Müşteri sipariş geçmişi    |
| orders          | (status, created_at DESC)                 | Admin sipariş listesi      |
| refresh_tokens  | (token_hash)                              | Token doğrulama            |

---

## 5. Önemli Tasarım Kararları

| Karar                          | Gerekçe                                                  |
|--------------------------------|----------------------------------------------------------|
| Adres snapshot sipariş tablosunda | Müşteri adres güncellemesi eski siparişleri etkilemesin |
| Ürün/varyant bilgisi order_items'ta | Ürün silinse bile sipariş geçmişi okunabilir kalır   |
| Soft delete (deleted_at)       | Sipariş geçmişi referansları korunur, veri kaybı olmaz  |
| search_vector tsvector         | Harici Elasticsearch maliyeti olmadan arama yeterli     |
| NUMERIC(12,2) para              | Float/double'dan kurtulur, para hassasiyeti korunur     |
| Refresh token hash'i sakla     | Token çalınsa bile DB'deki hash işe yaramaz             |
