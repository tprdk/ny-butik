# Ny Butik — Sipariş & İlgili Süreç Akışları

## 1. Sipariş Durum Makinesi

```
                    ┌─────────────────────┐
                    │   PENDING_PAYMENT   │  ◄── Sipariş oluşturuldu
                    └──────────┬──────────┘
                               │ Ödeme başlatıldı
                               ▼
                    ┌─────────────────────┐
                    │ PAYMENT_PROCESSING  │
                    └──────┬──────┬───────┘
                           │      │
              Başarılı ────┘      └──── Başarısız
                           │                │
                           ▼                ▼
              ┌────────────────┐   ┌──────────────────┐
              │     PAID       │   │  PAYMENT_FAILED  │ → Müşteri tekrar deneyebilir
              └───────┬────────┘   └──────────────────┘
                      │ Admin hazırlıyor
                      ▼
              ┌────────────────┐
              │   PREPARING    │
              └───────┬────────┘
                      │ Kargoya verildi
                      ▼
              ┌────────────────┐
              │    SHIPPED     │
              └───────┬────────┘
                      │ Teslim edildi
                      ▼
              ┌────────────────┐
              │   DELIVERED    │ ───► İade akışı başlayabilir (30 gün içinde)
              └────────────────┘

── İptal: PENDING_PAYMENT, PAID, PREPARING aşamalarında müşteri iptal edebilir ──
              ┌─────────────┐
              │  CANCELLED  │ ◄── Ödeme yapıldıysa otomatik iade tetiklenir
              └─────────────┘
```

**Geçiş Kuralları:**
| Mevcut Durum        | Hedef Durum          | Tetikleyen          |
|---------------------|----------------------|---------------------|
| PENDING_PAYMENT     | PAYMENT_PROCESSING   | Ödeme başlatıldı    |
| PAYMENT_PROCESSING  | PAID                 | Provider webhook    |
| PAYMENT_PROCESSING  | PAYMENT_FAILED       | Provider webhook    |
| PAYMENT_FAILED      | PAYMENT_PROCESSING   | Müşteri tekrar dener|
| PAID                | PREPARING            | Admin manuel        |
| PAID                | CANCELLED            | Müşteri/Admin       |
| PREPARING           | SHIPPED              | Admin + kargo kodu  |
| PREPARING           | CANCELLED            | Admin               |
| SHIPPED             | DELIVERED            | Kargo provider (mock)|
| PENDING_PAYMENT     | CANCELLED            | Müşteri / 30dk timeout|

---

## 2. Checkout Akışı (Adım Adım)

```
1. Kullanıcı "Siparişi Tamamla" butonuna tıklar

2. Frontend → POST /orders
   {shippingAddressId, billingAddressId, paymentMethod}

3. Backend OrderService.createOrder():
   a. Sepet boş mu? → 400
   b. Tüm varyantlar aktif mi? → stok kontrolü
   c. Her ürün için stok yeterli mi? (soft check)
   d. Kupon geçerli mi? (süre, limit, minimum tutar)
   e. Fiyatlar hesaplanır (subtotal, discount, shipping, total)
   f. Order kaydı oluşturulur (PENDING_PAYMENT)
   g. OrderStatusHistory kaydı eklenir
   h. PAYMENT_PROCESSING'e geçilir
   i. PaymentService.initiatePayment() çağrılır
      → MockAdapter: %95 başarı, %5 başarısız
   j. Webhook simülasyonu (MockAdapter anında callback)

4. Başarılı ödeme webhook:
   a. Payment kaydı güncellenir (SUCCESS)
   b. Order → PAID
   c. StockDecrementEvent yayınlanır
   d. Cart temizlenir
   e. Coupon.usedCount artırılır
   f. OrderPaidEvent yayınlanır

5. OrderPaidEvent dinleyicileri:
   a. NotificationModule → "Siparişiniz alındı" e-postası
   b. ShipmentModule → Shipment kaydı oluşturulur (CREATED)

6. Frontend → siparis-basarili/{orderNumber} sayfasına yönlenir
```

---

## 3. Ödeme Akışı (PaymentService Interface)

```java
public interface PaymentService {
    PaymentResult initiatePayment(PaymentRequest request);
    PaymentResult handleWebhook(String provider, Map<String, String> payload);
    RefundResult refund(String providerRef, BigDecimal amount);
}

// MockPaymentAdapter implementasyonu:
// - %95 olasılıkla SUCCESS döner (rastgele 0-100ms gecikme simüle eder)
// - %5 olasılıkla FAILED döner (gerçekçi hata kodları)
// - Webhook: kendi kendine tetikler (ApplicationEvent)
```

---

## 4. Kargo Akışı (ShipmentService Interface)

```java
public interface ShipmentService {
    ShipmentResult createShipment(ShipmentRequest request);
    ShipmentStatus trackShipment(String trackingNumber);
}

// MockShipmentAdapter:
// - createShipment: "NYB-{8 random alfanumerik}" takip numarası üretir
// - Durum simülasyonu (zamanlanmış görev — @Scheduled):
//   CREATED → PICKED_UP (2 dk)
//   PICKED_UP → IN_TRANSIT (5 dk)
//   IN_TRANSIT → DELIVERED (10 dk)
//   Her geçişte OrderStatusChangedEvent tetiklenir
//   DELIVERED → Order DELIVERED statüsüne güncellenir
```

---

## 5. İade Akışı

```
Müşteri                   Backend                     Admin
   │                          │                          │
   │── POST /returns ─────────►│                          │
   │  {orderId, reason,        │── Kontrol:               │
   │   description,            │   - Order DELIVERED mı?  │
   │   items[]}                │   - 30 gün içinde mi?    │
   │                          │   - Daha önce iade var mı?│
   │                          │── Return.REQUESTED oluştur│
   │                          │── Admin bildirim e-postası►│
   │                          │                          │
   │                          │                    Admin inceler
   │                          │                          │
   │                          │◄── PATCH /admin/returns/{id}/approve
   │                          │                          │
   │                          │── Return.APPROVED güncelle│
   │                          │── Kargo kodu üret (mock)  │
   │                          │── Müşteriye e-posta ───────────────►Müşteri
   │                          │   (kargo kodu + talimat)  │
   │                          │                          │
   │              (Müşteri ürünü kargolar)               │
   │                          │                          │
   │                          │◄── PATCH .../received     │
   │                          │                          │
   │                          │── Return.RETURN_RECEIVED  │
   │                          │── PaymentService.refund() │
   │                          │── Return.REFUNDED         │
   │                          │── Müşteriye iade e-postası────────►Müşteri

Durum makinesi:
REQUESTED → APPROVED → RETURN_RECEIVED → REFUNDED
          → REJECTED
```

---

## 6. Kupon Uygulama Akışı

```
POST /cart/coupon { "code": "YENI10" }

CouponService.validateAndApply():
  1. Kupon kodu var mı? (UNIQUE index ile hızlı lookup)
  2. is_active = true?
  3. Başlangıç/bitiş tarihi kontrolü
  4. max_uses doldu mu? (usedCount >= maxUses)
  5. Bu kullanıcı daha önce kullandı mı? (uses_per_user kontrolü)
  6. Sepet minimum tutarı karşılanıyor mu?
  7. → Cart.couponId set edilir
  8. İndirim hesaplanır ve sepet özetine eklenir (UYGULANMADI: kupon sayacı arttırılmaz)

Sipariş oluşturulduğunda:
  → Coupon.usedCount atomik olarak artırılır (@Version / optimistic lock)
```

---

## 7. Bildirim Tetikleyicileri

| Olay                      | Alıcı       | Kanal  | Şablon                    |
|---------------------------|-------------|--------|---------------------------|
| Kayıt tamamlandı          | Müşteri     | E-posta| email-verification.html   |
| E-posta doğrulandı        | Müşteri     | E-posta| welcome.html              |
| Sipariş alındı (PAID)     | Müşteri     | E-posta| order-confirmed.html      |
| Sipariş kargoya verildi   | Müşteri     | E-posta| shipped.html              |
| Sipariş teslim edildi     | Müşteri     | E-posta| delivered.html            |
| Sipariş iptal edildi      | Müşteri     | E-posta| order-cancelled.html      |
| İade onaylandı            | Müşteri     | E-posta| return-approved.html      |
| İade reddedildi           | Müşteri     | E-posta| return-rejected.html      |
| İade tamamlandı           | Müşteri     | E-posta| refund-completed.html     |
| Yeni iade talebi          | Admin       | E-posta| admin-return-request.html |
| Düşük stok uyarısı        | Admin       | E-posta| admin-low-stock.html      |
