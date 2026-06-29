import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import LoadingSpinner from '@/components/common/LoadingSpinner'

// Public layout
const PublicLayout = lazy(() => import('@/components/layout/PublicLayout'))
const AdminLayout = lazy(() => import('@/components/layout/AdminLayout'))
const AccountLayout = lazy(() => import('@/pages/account/AccountLayout'))

// Public pages
const HomePage = lazy(() => import('@/pages/public/HomePage'))
const ProductListPage = lazy(() => import('@/pages/public/ProductListPage'))
const ProductDetailPage = lazy(() => import('@/pages/public/ProductDetailPage'))
const CartPage = lazy(() => import('@/pages/public/CartPage'))
const NotFoundPage = lazy(() => import('@/pages/public/NotFoundPage'))

// Auth pages
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'))
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'))
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('@/pages/auth/ResetPasswordPage'))

// Account pages
const ProfilePage = lazy(() => import('@/pages/account/ProfilePage'))
const OrdersPage = lazy(() => import('@/pages/account/OrdersPage'))
const OrderDetailPage = lazy(() => import('@/pages/account/OrderDetailPage'))
const WishlistPage = lazy(() => import('@/pages/account/WishlistPage'))
const AddressesPage = lazy(() => import('@/pages/account/AddressesPage'))
const ReturnsPage = lazy(() => import('@/pages/account/ReturnsPage'))

// Checkout pages
const CheckoutPage = lazy(() => import('@/pages/checkout/CheckoutPage'))
const OrderSuccessPage = lazy(() => import('@/pages/checkout/OrderSuccessPage'))

// Admin pages
const DashboardPage = lazy(() => import('@/pages/admin/DashboardPage'))
const AdminProductListPage = lazy(() => import('@/pages/admin/products/ProductListPage'))
const ProductFormPage = lazy(() => import('@/pages/admin/products/ProductFormPage'))
const AdminOrderListPage = lazy(() => import('@/pages/admin/orders/OrderListPage'))
const AdminOrderDetailPage = lazy(() => import('@/pages/admin/orders/OrderDetailPage'))
const AdminReturnListPage = lazy(() => import('@/pages/admin/returns/ReturnListPage'))
const AdminReturnDetailPage = lazy(() => import('@/pages/admin/returns/ReturnDetailPage'))
const CouponPage = lazy(() => import('@/pages/admin/coupons/CouponPage'))
const CustomerListPage = lazy(() => import('@/pages/admin/customers/CustomerListPage'))
const CustomerDetailPage = lazy(() => import('@/pages/admin/customers/CustomerDetailPage'))
const ReportsPage = lazy(() => import('@/pages/admin/reports/ReportsPage'))

export default function App() {
  return (
    <Suspense fallback={<LoadingSpinner fullScreen />}>
      <Routes>
        {/* Public */}
        <Route element={<PublicLayout />}>
          <Route index element={<HomePage />} />
          <Route path="urunler" element={<ProductListPage />} />
          <Route path="urunler/:slug" element={<ProductDetailPage />} />
          <Route path="kategori/:slug" element={<ProductListPage />} />
          <Route path="sepet" element={<CartPage />} />
        </Route>

        {/* Auth */}
        <Route path="giris" element={<LoginPage />} />
        <Route path="kayit" element={<RegisterPage />} />
        <Route path="sifremi-unuttum" element={<ForgotPasswordPage />} />
        <Route path="sifre-sifirla" element={<ResetPasswordPage />} />

        {/* Checkout — Customer only */}
        <Route element={<ProtectedRoute requiredRole="CUSTOMER" />}>
          <Route path="odeme" element={<CheckoutPage />} />
          <Route path="siparis-basarili/:orderNumber" element={<OrderSuccessPage />} />
        </Route>

        {/* Account — Customer only */}
        <Route element={<ProtectedRoute requiredRole="CUSTOMER" />}>
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
        <Route element={<ProtectedRoute requiredRole="ADMIN" />}>
          <Route path="admin" element={<AdminLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="urunler" element={<AdminProductListPage />} />
            <Route path="urunler/yeni" element={<ProductFormPage />} />
            <Route path="urunler/:id/duzenle" element={<ProductFormPage />} />
            <Route path="siparisler" element={<AdminOrderListPage />} />
            <Route path="siparisler/:id" element={<AdminOrderDetailPage />} />
            <Route path="iadeler" element={<AdminReturnListPage />} />
            <Route path="iadeler/:id" element={<AdminReturnDetailPage />} />
            <Route path="kuponlar" element={<CouponPage />} />
            <Route path="musteriler" element={<CustomerListPage />} />
            <Route path="musteriler/:id" element={<CustomerDetailPage />} />
            <Route path="raporlar" element={<ReportsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  )
}
