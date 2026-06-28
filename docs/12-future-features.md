# Ny Butik — Gelecek Özellikler & Yol Haritası

## Phase 2 (3-6 ay sonra)

### Kullanıcı Deneyimi
- **Ürün değerlendirme & yorum sistemi** (yıldız + metin, admin moderasyonu)
- **Sosyal giriş** (Google OAuth 2.0)
- **Stok rezervasyon** (sepete ekleyince 15 dk. kilitlenir)
- **Ürün karşılaştırma** (max 3 ürün yan yana)
- **Son görüntülenen ürünler** (localStorage)
- **"Bunu alanlar bunu da aldı"** (basit: aynı kategoriden, henüz satın alınmamış)
- **Bildirim tercihleri** (müşteri hangi bildirimleri almak istediğini seçer)
- **SMS bildirimi** (kargo durumu — Twilio / Netgsm)
- **Push notification** (Web Push API — kargo güncellemesi)

### Admin Paneli
- **Toplu ürün yükleme** (CSV import)
- **Çoklu görsel toplu işleme** (sıkıştırma, WebP dönüşüm)
- **Gelişmiş raporlar** (müşteri kohort analizi, churn oranı)
- **Kampanya yönetimi** (belirli tarihlerde otomatik indirim)
- **Ürün varyant kopyalama** (benzer ürün oluştururken hızlandırır)

### Teknik
- **Redis** (access token kara listesi, rate limit state, sepet cache)
- **Meilisearch / Typesense** (gelişmiş ürün arama — yanlış yazım toleransı)
- **WebP otomatik dönüşüm** (sharp — görsel yükleme pipeline)
- **Async e-posta** (Spring @Async → kuyruk tabanlı gönderim)
- **Testcontainers** tüm entegrasyon testlerinde (PostgreSQL + Redis)
- **Playwright E2E** testleri (kritik akışlar: checkout, login, ürün listeleme)

---

## Phase 3 (6-12 ay)

### Ödeme & Kargo
- **Gerçek ödeme** (iyzico veya PayTR entegrasyonu)
- **Taksitli ödeme** (iyzico installment)
- **Kargo entegrasyonu** (Yurtiçi Kargo, MNG, Aras — webhook tabanlı durum güncellemesi)
- **Kapıda ödeme** (nakit / POS)
- **Cüzdan / hediye kartı** (internal kredi sistemi)

### Satış & Pazarlama
- **Sadakat puanı sistemi** (her sipariş puan kazandırır, sonraki siparişte kullanılır)
- **Tavsiye kodu** (müşteri tavsiye eder → her ikisine indirim)
- **Lansman öncesi bekleme listesi** (stok dolu ürün için e-posta bildirimi)
- **E-posta bülteni** (Mailchimp / Resend broadcast entegrasyonu)
- **Terk edilen sepet hatırlatması** (oturumunu kapatan müşteriye 1 saat sonra e-posta)

### Analytics
- **GA4 entegrasyonu** (ecommerce events: view_item, add_to_cart, purchase)
- **Meta Pixel** (Facebook/Instagram retargeting)
- **Admin gerçek zamanlı dashboard** (SSE/WebSocket ile canlı satış akışı)

---

## Phase 4 (12 ay+)

### Ölçeklenme
- **Microservice ayrıştırması** (catalog-service, order-service, notification-service)
- **Kubernetes** (Helm chart, autoscaling)
- **CDN önbelleği** (ürün listesi, kategori ağacı — Cloudflare Cache-Control)
- **Read replica** (raporlama sorguları ayrı replica'ya yönlenir)
- **Kafka** (async event bus — sipariş olayları, stok güncellemeleri)

### Uluslararasılaşma
- **Çok para birimi** (EUR, USD — döviz kuru API)
- **Çok dil** (i18next — Arapça, İngilizce)
- **Arapça RTL desteği** (Tailwind `dir="rtl"`, özel bileşen uyarlamaları)
- **Uluslararası kargo**

### Mobil
- **React Native uygulaması** (Expo) — API hazır olduğu için hızlı başlangıç
- **Push notification** (Expo Notifications / Firebase)
- **Biometric login** (Face ID / Fingerprint)

### Yapay Zeka
- **Akıllı ürün önerisi** (collaborative filtering veya embedding tabanlı)
- **Boyut tavsiyesi** (kullanıcı ölçülerine göre beden önerisi)
- **Otomatik ürün açıklaması üretme** (admin için Claude API entegrasyonu)
- **Müşteri hizmetleri chatbot** (ürün arama, sipariş takibi)
