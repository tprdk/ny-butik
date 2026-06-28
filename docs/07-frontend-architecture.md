# Ny Butik — Frontend Mimarisi & Klasör Yapısı

## 1. Teknoloji Kararları

| Araç              | Versiyon  | Rol                                             |
|-------------------|-----------|-------------------------------------------------|
| React             | 18        | UI kütüphanesi                                  |
| TypeScript        | 5.x       | Tip güvenliği                                   |
| Vite              | 5.x       | Build aracı, HMR                                |
| React Router      | v6        | Client-side routing, nested routes              |
| TanStack Query    | v5        | Server state yönetimi, caching, optimistic UI   |
| Zustand           | 5.x       | Client state (sepet, auth, UI state)            |
| React Hook Form   | 7.x       | Form yönetimi (controlled-free, performanslı)   |
| Zod               | 3.x       | Schema validasyonu (form + API tipi paylaşımı)  |
| Tailwind CSS      | 3.x       | Utility-first styling                           |
| shadcn/ui         | latest    | Radix UI tabanlı, özelleştirilebilir bileşenler |
| Framer Motion     | 11.x      | Animasyonlar, layout transitions                |
| Axios             | 1.x       | HTTP client (interceptors, retry)               |

---

## 2. Klasör Yapısı

```
ny-butik-web/
├── public/
│   ├── favicon.ico
│   ├── robots.txt
│   └── sitemap.xml            # Backend'den fetch edilebilir veya statik
│
├── src/
│   ├── main.tsx               # React root, QueryClientProvider, BrowserRouter
│   ├── App.tsx                # Route tanımları
│   │
│   ├── api/                   # Tüm API çağrıları — TanStack Query hooks
│   │   ├── client.ts          # Axios instance, interceptors, token yenileme
│   │   ├── endpoints.ts       # Endpoint sabitleri
│   │   ├── auth.api.ts
│   │   ├── catalog.api.ts
│   │   ├── cart.api.ts
│   │   ├── order.api.ts
│   │   ├── wishlist.api.ts
│   │   ├── return.api.ts
│   │   ├── user.api.ts
│   │   └── admin/
│   │       ├── products.api.ts
│   │       ├── orders.api.ts
│   │       ├── returns.api.ts
│   │       ├── coupons.api.ts
│   │       ├── customers.api.ts
│   │       └── reports.api.ts
│   │
│   ├── hooks/                 # TanStack Query custom hooks
│   │   ├── useProducts.ts
│   │   ├── useProduct.ts
│   │   ├── useCategories.ts
│   │   ├── useCart.ts
│   │   ├── useOrders.ts
│   │   ├── useWishlist.ts
│   │   ├── useAuth.ts
│   │   └── admin/
│   │       ├── useAdminProducts.ts
│   │       ├── useAdminOrders.ts
│   │       └── useAdminDashboard.ts
│   │
│   ├── store/                 # Zustand stores
│   │   ├── auth.store.ts      # kullanıcı bilgisi, token
│   │   ├── cart.store.ts      # misafir sepeti (localStorage sync)
│   │   └── ui.store.ts        # modal, drawer, toast state
│   │
│   ├── types/                 # TypeScript tip tanımları
│   │   ├── api.types.ts       # ApiResponse<T>, PageResponse<T>
│   │   ├── product.types.ts
│   │   ├── order.types.ts
│   │   ├── cart.types.ts
│   │   ├── user.types.ts
│   │   └── admin.types.ts
│   │
│   ├── schemas/               # Zod validasyon şemaları (form + API)
│   │   ├── auth.schema.ts
│   │   ├── checkout.schema.ts
│   │   ├── address.schema.ts
│   │   └── admin/
│   │       ├── product.schema.ts
│   │       └── coupon.schema.ts
│   │
│   ├── lib/                   # Yardımcı araçlar
│   │   ├── utils.ts           # cn() helper (clsx + tailwind-merge)
│   │   ├── format.ts          # Para, tarih, telefon formatlama
│   │   ├── constants.ts       # Uygulama sabitleri
│   │   └── seo.ts             # Meta tag helpers
│   │
│   ├── components/            # Yeniden kullanılabilir bileşenler
│   │   ├── ui/                # shadcn/ui bileşenleri (otomatik üretilir)
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── drawer.tsx
│   │   │   ├── select.tsx
│   │   │   ├── table.tsx
│   │   │   ├── toast.tsx
│   │   │   └── ...
│   │   │
│   │   ├── layout/            # Genel layout bileşenleri
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── MobileNav.tsx
│   │   │   ├── Breadcrumb.tsx
│   │   │   └── AdminLayout.tsx
│   │   │
│   │   ├── common/            # Paylaşılan alan bileşenleri
│   │   │   ├── ProductCard.tsx
│   │   │   ├── ProductCardSkeleton.tsx
│   │   │   ├── PriceDisplay.tsx
│   │   │   ├── StockBadge.tsx
│   │   │   ├── ColorSwatch.tsx
│   │   │   ├── SizeSelector.tsx
│   │   │   ├── ImageGallery.tsx
│   │   │   ├── Pagination.tsx
│   │   │   ├── FilterSidebar.tsx
│   │   │   ├── SearchBar.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   ├── ErrorBoundary.tsx
│   │   │   └── LoadingSpinner.tsx
│   │   │
│   │   ├── cart/
│   │   │   ├── CartDrawer.tsx
│   │   │   ├── CartItem.tsx
│   │   │   └── CartSummary.tsx
│   │   │
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   │
│   │   └── admin/
│   │       ├── DataTable.tsx       # TanStack Table wrapper
│   │       ├── StatCard.tsx
│   │       ├── StatusBadge.tsx
│   │       └── ImageUploader.tsx
│   │
│   ├── pages/                 # Route bazlı sayfa bileşenleri
│   │   │
│   │   ├── public/            # Guest erişilebilir
│   │   │   ├── HomePage.tsx
│   │   │   ├── ProductListPage.tsx
│   │   │   ├── ProductDetailPage.tsx
│   │   │   ├── CategoryPage.tsx
│   │   │   ├── SearchPage.tsx
│   │   │   ├── CartPage.tsx
│   │   │   ├── NotFoundPage.tsx
│   │   │   └── StaticPages/
│   │   │       ├── AboutPage.tsx
│   │   │       ├── ContactPage.tsx
│   │   │       └── PolicyPage.tsx
│   │   │
│   │   ├── auth/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   ├── ForgotPasswordPage.tsx
│   │   │   └── ResetPasswordPage.tsx
│   │   │
│   │   ├── account/           # Customer (korumalı)
│   │   │   ├── AccountLayout.tsx
│   │   │   ├── ProfilePage.tsx
│   │   │   ├── OrdersPage.tsx
│   │   │   ├── OrderDetailPage.tsx
│   │   │   ├── WishlistPage.tsx
│   │   │   ├── AddressesPage.tsx
│   │   │   └── ReturnsPage.tsx
│   │   │
│   │   ├── checkout/
│   │   │   ├── CheckoutPage.tsx
│   │   │   ├── CheckoutAddress.tsx
│   │   │   ├── CheckoutPayment.tsx
│   │   │   └── OrderSuccessPage.tsx
│   │   │
│   │   └── admin/             # Admin (korumalı)
│   │       ├── AdminLayout.tsx
│   │       ├── DashboardPage.tsx
│   │       ├── products/
│   │       │   ├── ProductListPage.tsx
│   │       │   ├── ProductFormPage.tsx    # Oluştur & Düzenle
│   │       │   └── ProductVariantsPage.tsx
│   │       ├── categories/
│   │       │   └── CategoryPage.tsx
│   │       ├── orders/
│   │       │   ├── OrderListPage.tsx
│   │       │   └── OrderDetailPage.tsx
│   │       ├── returns/
│   │       │   ├── ReturnListPage.tsx
│   │       │   └── ReturnDetailPage.tsx
│   │       ├── coupons/
│   │       │   └── CouponPage.tsx
│   │       ├── customers/
│   │       │   └── CustomerListPage.tsx
│   │       └── reports/
│   │           └── ReportsPage.tsx
│   │
│   └── styles/
│       ├── globals.css        # Tailwind directives + CSS custom properties
│       └── animations.css     # Framer Motion variants (paylaşılan)
│
├── index.html
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── tsconfig.node.json
├── components.json            # shadcn/ui config
├── .env.example
├── .env.local
└── package.json
```

---

## 3. Route Yapısı (React Router v6)

```tsx
// App.tsx
<BrowserRouter>
  <Routes>
    {/* Public Layout */}
    <Route element={<PublicLayout />}>
      <Route index element={<HomePage />} />
      <Route path="urunler" element={<ProductListPage />} />
      <Route path="urunler/:slug" element={<ProductDetailPage />} />
      <Route path="kategori/:slug" element={<CategoryPage />} />
      <Route path="arama" element={<SearchPage />} />
      <Route path="sepet" element={<CartPage />} />
      <Route path="hakkimizda" element={<AboutPage />} />
      <Route path="iletisim" element={<ContactPage />} />
    </Route>

    {/* Auth */}
    <Route path="giris" element={<LoginPage />} />
    <Route path="kayit" element={<RegisterPage />} />
    <Route path="sifremi-unuttum" element={<ForgotPasswordPage />} />
    <Route path="sifre-sifirla" element={<ResetPasswordPage />} />

    {/* Checkout — Customer only */}
    <Route element={<ProtectedRoute role="CUSTOMER" />}>
      <Route path="odeme" element={<CheckoutPage />}>
        <Route index element={<CheckoutAddress />} />
        <Route path="odeme-yontemi" element={<CheckoutPayment />} />
      </Route>
      <Route path="siparis-basarili/:orderNumber" element={<OrderSuccessPage />} />
    </Route>

    {/* Account — Customer only */}
    <Route element={<ProtectedRoute role="CUSTOMER" />}>
      <Route path="hesabim" element={<AccountLayout />}>
        <Route index element={<ProfilePage />} />
        <Route path="siparisler" element={<OrdersPage />} />
        <Route path="siparisler/:orderNumber" element={<OrderDetailPage />} />
        <Route path="favoriler" element={<WishlistPage />} />
        <Route path="adresler" element={<AddressesPage />} />
        <Route path="iadeler" element={<ReturnsPage />} />
      </Route>
    </Route>

    {/* Admin — Admin only */}
    <Route element={<ProtectedRoute role="ADMIN" />}>
      <Route path="admin" element={<AdminLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="urunler" element={<ProductListPage />} />
        <Route path="urunler/yeni" element={<ProductFormPage />} />
        <Route path="urunler/:id/duzenle" element={<ProductFormPage />} />
        <Route path="kategoriler" element={<CategoryPage />} />
        <Route path="siparisler" element={<AdminOrderListPage />} />
        <Route path="siparisler/:id" element={<AdminOrderDetailPage />} />
        <Route path="iadeler" element={<AdminReturnListPage />} />
        <Route path="iadeler/:id" element={<AdminReturnDetailPage />} />
        <Route path="kuponlar" element={<CouponPage />} />
        <Route path="musteriler" element={<CustomerListPage />} />
        <Route path="raporlar" element={<ReportsPage />} />
      </Route>
    </Route>

    <Route path="*" element={<NotFoundPage />} />
  </Routes>
</BrowserRouter>
```

---

## 4. State Yönetimi Stratejisi

```
Server State          → TanStack Query (ürünler, siparişler, sepet backend'de)
Client UI State       → Zustand (modal açık/kapalı, drawer, toast queue)
Auth State            → Zustand + localStorage (accessToken memory'de, refresh cookie'de)
Form State            → React Hook Form + Zod
Guest Cart State      → Zustand + localStorage (backend'e merge edilir)
```

---

## 5. API Client (Axios) Konfigürasyonu

```typescript
// api/client.ts
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,     // refresh cookie otomatik gönderilir
  timeout: 10_000,
});

// Request interceptor: access token ekle
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor: 401 → token yenile
apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true;
      const newToken = await refreshAccessToken();
      error.config.headers.Authorization = `Bearer ${newToken}`;
      return apiClient(error.config);
    }
    return Promise.reject(error);
  }
);
```

---

## 6. Tasarım Sistemi & UI/UX Prensipleri

### Renk Paleti (Tailwind token'ları)
```
Primary:   #1A1A1A (derin siyah — marka rengi)
Secondary: #B8976A (altın bej — vurgu)
Accent:    #F5F0E8 (krem beyaz — arka plan)
Surface:   #FFFFFF
Muted:     #6B7280
Error:     #EF4444
Success:   #10B981
```

### Tipografi
- Font: `"Inter"` + `"Playfair Display"` (başlıklar için serif)
- Mobil öncelikli font boyutları: 14/16/18/24/32/40

### Bileşen Prensipleri
- **Mobile-first:** `sm:` breakpoint ile masaüstüne geçiş
- **Skeleton loading:** İçerik yüklenirken gerçek boyutlu placeholder
- **Optimistic UI:** Sepete ekleme, favoriye ekleme anında yansır
- **Error states:** Her form alanı ve liste için hata durumu tasarlanır
- **Empty states:** Favori yok, sipariş yok için anlamlı boş durum görseli

### Animasyon Stratejisi (Framer Motion)
```typescript
// Sayfa geçişleri
const pageVariants = {
  initial: { opacity: 0, y: 8 },
  enter: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -8 }
};

// Ürün kartı hover
const cardVariants = {
  rest: { scale: 1 },
  hover: { scale: 1.02, transition: { duration: 0.2 } }
};

// Liste animasyonu (stagger)
const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } }
};
```

---

## 7. SEO Stratejisi (React SPA)

```typescript
// Helmet ile meta yönetimi
import { Helmet } from 'react-helmet-async';

// ProductDetailPage.tsx
<Helmet>
  <title>{product.name} | Ny Butik</title>
  <meta name="description" content={product.shortDesc} />
  <meta property="og:title" content={product.name} />
  <meta property="og:image" content={product.primaryImage} />
  <meta property="og:type" content="product" />
  <link rel="canonical" href={`https://nybutik.com/urunler/${product.slug}`} />
</Helmet>
```

**Not:** İleride Next.js'e taşıma kolaylığı için:
- Sayfa bileşenleri `loader` pattern'ini taklit eder (React Router loaders)
- `useProduct(slug)` hook'u `useQuery` sargısıdır → Next.js `fetch` ile değiştirilebilir
- Routing yapısı Next.js App Router'a birebir map edilebilir

---

## 8. Erişilebilirlik (a11y) Kontrol Listesi

- shadcn/ui → Radix UI → tüm bileşenler ARIA uyumlu
- Keyboard focus ring'leri Tailwind ile görünür
- Renk kontrast: AA minimum (araç: axe DevTools)
- Form hataları `aria-invalid` + `aria-describedby` ile bağlanır
- Görsel içeriklerde `alt` metni zorunlu (TypeScript ile enforce)
- Skip-to-main-content linki header'da

---

## 9. Performance Optimizasyonları

```typescript
// Lazy loading — route bazlı code splitting
const ProductDetailPage = lazy(() => import('./pages/public/ProductDetailPage'));

// Görsel optimizasyonu
<img
  src={product.primaryImageUrl}
  loading="lazy"
  decoding="async"
  width={400}
  height={533}
  alt={product.name}
/>

// TanStack Query staleTime
const { data } = useQuery({
  queryKey: ['products', filters],
  queryFn: () => fetchProducts(filters),
  staleTime: 5 * 60 * 1000,   // 5 dakika cache
  gcTime: 10 * 60 * 1000,
});
```

### Core Web Vitals Hedefleri
| Metrik | Hedef   | Strateji                                           |
|--------|---------|----------------------------------------------------|
| LCP    | < 2.5s  | Birincil görsel preload, Cloudflare CDN            |
| FID/INP| < 200ms | React 18 concurrent, lazy loading                 |
| CLS    | < 0.1   | Görsel boyut rezervasyonu (width/height zorunlu)   |
