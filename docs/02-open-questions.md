# Ny Butik — Eksik Noktalar & Açık Sorular

Bu belge, planı netleştirmeden önce yanıt bekleyen soruları listeler.
Yanıtlar verilmeden geliştirmeye geçilmemesi önerilir.

---

## Kritik Sorular (Geliştirmeyi Doğrudan Etkiler)

### S1 — Alan adı & marka adı
Marka adı "Ny Butik" mi kesin? Frontend URL yapısı, SEO slug'ları ve e-posta
gönderici adı buna göre ayarlanacak.

Evet "NY Butik" şeklinde kullanabiliriz. 

### S2 — Para birimi & KDV
- Yalnızca TRY mi, yoksa EUR/USD desteği de (Phase 1'de)?

Sadece TRY yeterli

- Fiyatlar KDV dahil mi gösterilecek? KDV oranı sabit mi (%20) yoksa kategoriye
  göre farklılaşacak mı?

başta sabit düşünelim ileride bu konuya bakarız.


- Fatura kesme zorunluluğu var mı (e-fatura entegrasyonu)?

şuanda yok olarak düşünelim ancak adapte olmamız gerekebilir.

### S3 — Kargo ücreti hesaplama
- Sabit kargo ücreti mi? (ör. 49,90 ₺)
- Belirli tutarın üzerinde ücretsiz kargo eşiği var mı?
- Farklı kargo bölgelerine farklı tarife uygulanacak mı?

Şuanda bunları tamamen sabit düşünebiliriz ancak ileride eklenebilir.

### S4 — Ödeme yöntemi yol haritası
Simülasyon sonrasında hangi gerçek sağlayıcıya geçilecek?
- iyzico (yaygın Türkiye tercihi)
- PayTR
- Stripe (uluslararası)
Bu, `PaymentService` adapter öncelik sıralamasını belirler.

iyzico kullanılabilir, çok yoğun olmayan az kullanım durumunda hangisi avantajlıdır.


### S5 — Ürün fotoğrafı depolama
- Cloudflare R2 kullanımı onaylı mı?
- Maksimum fotoğraf boyutu/adedi: önerilen 5 MB / ürün başına 10 fotoğraf.
- Otomatik görüntü optimizasyonu (WebP dönüşümü, boyutlandırma) gerekiyor mu?
  → `sharp` tabanlı bir mikroservis veya Cloudflare Images eklentisi.


Bu konuda bir fikrim yok açıkçası. Bu konuda daha açıklayıcı olabili rmisin


### S6 — E-posta gönderimi
- Transactional e-posta sağlayıcısı: Resend, SendGrid, SES?
- Başlangıç için ücretsiz tier yeterli (Resend 3.000/ay ücretsiz önerilir).
- Marka e-posta adresi: `noreply@nybutik.com` gibi?


aynen böyle kulllanıabilir.

### S7 — Çoklu dil (i18n)
- Yalnızca Türkçe mi? Arapça / İngilizce ileride eklenecek mi?
- Eğer ilerisi planlanıyorsa frontend'e i18next şimdi kurulması daha az maliyetli.


Türkçe yeterli

### S8 — Sosyal giriş (OAuth)
- Google / Apple ile giriş Phase 1'de mi isteniyor yoksa sadece e-posta/şifre mi?

şuanda sadece eposta - şifre

### S9 — Müşteri KVKK & Gizlilik
- Gizlilik politikası & aydınlatma metni kim tarafından hazırlanacak?
- Çerez onay banner'ı gerekiyor mu? (Türkiye mevzuatı gereği evet)
- Müşteri hesabı silme talebi akışı (veri silme hakkı) hazırlanmalı mı?

bunu şimdi düşünmeylim en son işler bunlar değil mi

### S10 — Stok yönetimi derinliği
- Stok rezervasyon mantığı isteniyor mu?
  (ör. sepete eklenince 15 dk rezerve edilsin, ödeme tamamlanmazsa serbest bırakılsın)
- Şimdilik soft check (checkout anında stok kontrolü) yeterli mi?
  → **Öneri:** Phase 1'de soft check, Phase 2'de rezervasyon.

---


evet soft check yeterli. 

## Önemli Sorular (Tasarımı Etkiler)

### S11 — Beden/renk varyant yapısı
- Beden skalaları: XS-XXL mi, 36-52 beden numarası mı, ikisi birden mi?
- Renk sisteminde görsel renk kodu (hex) mi, metin mi, yoksa her ikisi birden mi?
- Ürün başına maksimum kaç varyant? (ör. 5 renk × 8 beden = 40 varyant)


Ürüne göre beden skalası değişeblir. Her 2 durumu da ekle
.

Renkler metin

40 gayet yeterli

### S12 — Ürün ağacı derinliği
- Kategori örnekleri: Elbise > Abiye > Uzun Abiye gibi mi?
- Maksimum 3 seviye yeterli mi?

2 bile yeterli gibi.
Kategorilerin başlangıcı elbise değil, daha genel "kıyafet", "üst giyim" gibi olabilir. elbise zaten alt kategoride olacak

### S13 — Dashboard metrikleri
Admin dashboard için hangi metrikler öncelikli?
- Önerilen minimum set: Günlük satış tutarı, sipariş sayısı, en çok satan 5 ürün,
  düşük stok uyarısı, bugünkü yeni kayıtlar.

bunlar yeterli

### S14 — Mobil uygulama
Şimdilik web öncelikli mi? İleride React Native uygulaması planlanıyor mu?
Bu, API tasarımındaki bazı kararları (offline-first, push notification) etkiler.

mobil uygulama olmayacak.


### S15 — Yorum & Değerlendirme sistemi
Ürün yorumları Phase 1'de mi isteniyor? (yıldız puanı, metin yorum)
Moderasyon (admin onayı) gerekiyor mu?


ilk aşamada yorum olmasın. ileride eklenebilir

---

## Varsayılanlar (Soru Beklemeksizin Uygulanacak)

Aşağıdakiler yanıt beklenmeksizin uygulanacak best practice varsayımlarıdır:

| Konu                        | Varsayılan Karar                                        |
|-----------------------------|---------------------------------------------------------|
| Stok yönetimi               | Phase 1: soft check (checkout anında)                  |
| SEO yaklaşımı               | React SPA + meta tags; Next.js Phase 2 opsiyonu        |
| Kargo                       | Sabit ücret + ücretsiz kargo eşiği (yapılandırılabilir)|
| Ödeme simülasyonu           | MockPaymentAdapter; %20 rastgele başarısızlık          |
| Fotoğraf depolama           | Cloudflare R2 + imzalı URL                             |
| E-posta                     | Resend API (ücretsiz tier)                             |
| Loglama                     | JSON yapısal log, Correlation-ID, her ortam için farklı seviye |
| Para birimi                 | Yalnızca TRY (Phase 1)                                 |
| Dil                         | Yalnızca Türkçe (Phase 1)                              |
| Sosyal giriş                | Phase 2                                                |
| Ürün değerlendirmesi        | Phase 2                                                |
| Stok rezervasyon            | Phase 2                                                |
| Çerez banner                | Phase 1 (yasal zorunluluk)                             |
