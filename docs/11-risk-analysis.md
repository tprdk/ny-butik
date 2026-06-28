# Ny Butik — Risk Analizi

## 1. Teknik Riskler

| Risk                              | Olasılık | Etki    | Önlem                                                    |
|-----------------------------------|----------|---------|----------------------------------------------------------|
| N+1 sorgu performans sorunu       | Yüksek   | Orta    | `@EntityGraph`, `JOIN FETCH`, Hibernate batch fetch      |
| JWT refresh token race condition  | Orta     | Yüksek  | Token rotation + veritabanı geçerlilik kontrolü          |
| Stok race condition (eş zamanlı sipariş) | Orta | Yüksek | Phase 1: soft check yeterli; Phase 2: optimistic lock    |
| Görsel yükleme başarısızlıkları   | Orta     | Düşük   | Transactional değil; başarısız upload rollback mantığı   |
| Flyway migration çakışması        | Düşük    | Yüksek  | PR'da migration file adı kontrolü, çakışma testi         |
| Üçüncü taraf e-posta limiti       | Düşük    | Orta    | Resend 3k/ay ücretsiz; aşılırsa ücretli plana geç       |
| PostgreSQL full-text search yetersizliği | Düşük | Orta | Phase 2: Meilisearch / Typesense (self-host, ucuz)      |

---

## 2. İş Riskleri

| Risk                              | Olasılık | Etki    | Önlem                                                    |
|-----------------------------------|----------|---------|----------------------------------------------------------|
| Gerçek ödeme entegrasyonu gecikmesi | Orta   | Yüksek  | iyzico API'si erken incelenmeli; sandbox hesap açılmalı  |
| Kargo entegrasyon maliyeti        | Düşük    | Orta    | Kargo şirketi entegrasyon kılavuzları önceden incelenmeli|
| Düşük ilk trafik → yatırım geri dönüşü | Yüksek | Düşük | Minimum viable product; erken SEO çalışması            |
| Ürün fotoğrafı kalitesi / yükleme | Yüksek  | Orta    | Admin'e görsel boyut/format rehberi + otomatik WebP dönüşümü |
| KVKK uyumsuzluk                   | Orta     | Yüksek  | Hukuki metin + çerez banner Phase 1'de tamamlanmalı      |

---

## 3. Güvenlik Riskleri

| Risk                              | Olasılık | Etki    | Önlem                                                    |
|-----------------------------------|----------|---------|----------------------------------------------------------|
| Credential stuffing               | Yüksek   | Orta    | Rate limiting + bcrypt cost 12 + Cloudflare WAF          |
| Admin account ele geçirilmesi     | Düşük    | Kritik  | 2FA Phase 2; şimdi güçlü şifre politikası               |
| XSS (React render'dan değil, API'den ham HTML) | Düşük | Yüksek | CSP header + React default encoding              |
| Supply chain: bağımlılık açığı   | Orta     | Orta    | OWASP dependency-check CI'da; Renovate otomasyonu        |

---

## 4. Operasyonel Riskler

| Risk                              | Önlem                                                    |
|-----------------------------------|----------------------------------------------------------|
| Veritabanı yedek yok              | Railway/Supabase otomatik yedek (günlük) + manuel aylık  |
| Tek sunucu SPOF                   | Başlangıç için kabul edilebilir; Phase 2'de load balancer|
| Sertifika yenileme                | Cloudflare otomatik TLS yönetimi                         |
| Log izleme eksikliği              | Sentry ücretsiz tier (hata izleme) + Cloudflare Analytics|
