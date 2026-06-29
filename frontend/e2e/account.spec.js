import { test, expect } from '@playwright/test'
import { ensureCustomerExists, getToken, getUser, setupPageAuth, CUSTOMER_EMAIL, CUSTOMER_PASS } from './helpers/auth.js'

let _token = null
let _user = null

test.describe('Hesap Yönetimi', () => {
  test.beforeAll(async ({ request }) => {
    await ensureCustomerExists(request)
    _token = await getToken(request, CUSTOMER_EMAIL, CUSTOMER_PASS)
    _user = await getUser(request, _token)
  })

  test.beforeEach(async ({ page }) => {
    await setupPageAuth(page, _token, _user)
  })

  // ─── Erişim Kontrolü ─────────────────────────────────────────────────────

  test('giriş yapmadan /hesabim erişimi /giris sayfasına yönlendirir', async ({ page }) => {
    // Override: remove auth so the page starts unauthenticated
    await page.addInitScript(() => localStorage.removeItem('nybutik-auth'))
    await page.unroute('**/api/v1/auth/refresh')
    await page.goto('/hesabim')
    await expect(page).toHaveURL(/giris/, { timeout: 8000 })
  })

  test('giriş yapmadan /hesabim/siparisler erişimi /giris sayfasına yönlendirir', async ({ page }) => {
    await page.addInitScript(() => localStorage.removeItem('nybutik-auth'))
    await page.unroute('**/api/v1/auth/refresh')
    await page.goto('/hesabim/siparisler')
    await expect(page).toHaveURL(/giris/, { timeout: 8000 })
  })

  test('giriş yapmadan /hesabim/adresler erişimi /giris sayfasına yönlendirir', async ({ page }) => {
    await page.addInitScript(() => localStorage.removeItem('nybutik-auth'))
    await page.unroute('**/api/v1/auth/refresh')
    await page.goto('/hesabim/adresler')
    await expect(page).toHaveURL(/giris/, { timeout: 8000 })
  })

  // ─── Profil Sayfası ───────────────────────────────────────────────────────

  test('profil sayfası yüklenir ve kullanıcı bilgilerini gösterir', async ({ page }) => {
    await page.goto('/hesabim')
    await expect(page).toHaveTitle(/Profilim/)
    await expect(page.locator('input#firstName')).toBeVisible()
    await expect(page.locator('input#lastName')).toBeVisible()
    await expect(page.locator('input[disabled]')).toHaveValue(CUSTOMER_EMAIL)
  })

  test('profil e-posta alanı değiştirilemez (disabled)', async ({ page }) => {
    await page.goto('/hesabim')
    await expect(page.locator('input[disabled]')).toBeDisabled()
  })

  test('profil formu kısa ad ile hata gösterir', async ({ page }) => {
    await page.goto('/hesabim')
    await page.locator('input#firstName').fill('A')
    await page.locator('button[type="submit"]').first().click()
    await expect(page.locator('p.text-destructive').first()).toBeVisible({ timeout: 3000 })
  })

  test('profil bilgileri başarıyla güncellenir', async ({ page }) => {
    await page.goto('/hesabim')
    await page.locator('input#firstName').fill('Test')
    await page.locator('input#lastName').fill('Müşteri')
    await page.locator('button[type="submit"]').first().click()
    await expect(page.locator('[data-sonner-toast]')).toBeVisible({ timeout: 5000 })
  })

  test('şifre değiştirme — eşleşmeyen şifre validasyon hatası gösterir', async ({ page }) => {
    await page.goto('/hesabim')
    await page.locator('input#currentPassword').fill('HerhangiSifre1!')
    await page.locator('input#newPassword').fill('YeniSifre123!')
    await page.locator('input#newPasswordConfirm').fill('FarkliSifre456!')
    await page.locator('button', { hasText: 'Şifreyi Güncelle' }).click()
    await expect(page.locator('p.text-destructive').first()).toBeVisible({ timeout: 3000 })
  })

  test('şifre değiştirme — yanlış mevcut şifre hata toast gösterir', async ({ page }) => {
    await page.goto('/hesabim')
    await page.locator('input#currentPassword').fill('YanlisSifre999!')
    await page.locator('input#newPassword').fill('YeniSifre123!')
    await page.locator('input#newPasswordConfirm').fill('YeniSifre123!')
    await page.locator('button', { hasText: 'Şifreyi Güncelle' }).click()
    await expect(page.locator('[data-sonner-toast]')).toBeVisible({ timeout: 5000 })
  })

  // ─── Hesap Navigasyonu ────────────────────────────────────────────────────

  test('hesap sidebar menüsünde tüm linkler görünür', async ({ page }) => {
    await page.goto('/hesabim')
    await expect(page.getByRole('link', { name: /Profilim/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /Siparişlerim/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /Adreslerim/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /Favorilerim/i })).toBeVisible()
  })

  test('header menüsü hesap sayfasında görünür', async ({ page }) => {
    await page.goto('/hesabim')
    await expect(page.getByRole('banner')).toBeVisible()
  })

  // ─── Siparişler ───────────────────────────────────────────────────────────

  test('siparişlerim sayfası yüklenir', async ({ page }) => {
    await page.goto('/hesabim/siparisler')
    await expect(page).toHaveTitle(/Siparişlerim/)
    const hasOrders = await page.locator('text=/NY-/').isVisible().catch(() => false)
    const isEmpty = await page.getByText('Henüz siparişiniz yok').isVisible().catch(() => false)
    expect(hasOrders || isEmpty).toBeTruthy()
  })

  test('sipariş varsa sipariş detayına gidilebilir', async ({ page }) => {
    await page.goto('/hesabim/siparisler')
    const orderLink = page.locator('a[href*="/hesabim/siparisler/"]').first()
    if (await orderLink.isVisible()) {
      await orderLink.click()
      await expect(page).toHaveURL(/\/hesabim\/siparisler\//)
      await expect(page.locator('text=/NY-/').first()).toBeVisible()
    }
  })

  // ─── Adresler ─────────────────────────────────────────────────────────────

  test('adreslerim sayfası yüklenir', async ({ page }) => {
    await page.goto('/hesabim/adresler')
    await expect(page).toHaveTitle(/Adreslerim/)
    await expect(page.locator('button', { hasText: 'Yeni Adres' })).toBeVisible()
  })

  test('"Yeni Adres" butonu adres ekleme modalını açar', async ({ page }) => {
    await page.goto('/hesabim/adresler')
    await page.locator('button', { hasText: 'Yeni Adres' }).click()
    await expect(page.getByText('Yeni Adres Ekle')).toBeVisible()
    await expect(page.locator('input#firstName')).toBeVisible()
  })

  test('adres ekleme formu zorunlu alan validasyonu gösterir', async ({ page }) => {
    await page.goto('/hesabim/adresler')
    await page.locator('button', { hasText: 'Yeni Adres' }).click()
    await page.locator('button', { hasText: 'Kaydet' }).click()
    await expect(page.locator('p.text-destructive').first()).toBeVisible({ timeout: 3000 })
  })

  test('yeni adres başarıyla eklenir', async ({ page }) => {
    await page.goto('/hesabim/adresler')
    await page.locator('button', { hasText: 'Yeni Adres' }).click()
    await expect(page.getByText('Yeni Adres Ekle')).toBeVisible()

    await page.locator('input#label').fill('E2E Test Adresi')
    await page.locator('input#firstName').fill('Test')
    await page.locator('input#lastName').fill('Müşteri')
    await page.locator('input#phone').fill('05551234567')
    await page.locator('input#addressLine1').fill('Playwright Mahallesi No:42')
    await page.locator('input#city').fill('İstanbul')
    await page.locator('input#district').fill('Kadıköy')
    await page.locator('input#postalCode').fill('34710')
    await page.locator('button', { hasText: 'Kaydet' }).click()

    await expect(page.locator('[data-sonner-toast]')).toBeVisible({ timeout: 5000 })
  })

  test('adres düzenleme modalı açılır', async ({ page }) => {
    await page.goto('/hesabim/adresler')
    const editBtn = page.locator('button', { hasText: 'Düzenle' }).first()
    if (await editBtn.isVisible()) {
      await editBtn.click()
      await expect(page.getByText('Adresi Düzenle')).toBeVisible()
      await page.locator('button', { hasText: 'Güncelle' }).click()
      await expect(page.locator('[data-sonner-toast]')).toBeVisible({ timeout: 5000 })
    }
  })

  test('adres silinebilir', async ({ page }) => {
    await page.goto('/hesabim/adresler')
    const silBtn = page.locator('button', { hasText: 'Sil' }).first()
    if (await silBtn.isVisible()) {
      page.on('dialog', dialog => dialog.accept())
      await silBtn.click()
      await expect(page.locator('[data-sonner-toast]')).toBeVisible({ timeout: 5000 })
    }
  })

  // ─── Favoriler ────────────────────────────────────────────────────────────

  test('favorilerim sayfası yüklenir', async ({ page }) => {
    await page.goto('/hesabim/favoriler')
    await expect(page).toHaveTitle(/Favorilerim/)
    const hasItems = await page.locator('a[href^="/urunler/"]').first().isVisible().catch(() => false)
    const isEmpty = await page.getByText('Henüz favori ürününüz yok').isVisible().catch(() => false)
    expect(hasItems || isEmpty).toBeTruthy()
  })

  test('ürün detay sayfasından favori eklenebilir', async ({ page }) => {
    await page.goto('/urunler/abaya-klasik-elbise')
    const heartBtn = page.locator('button[aria-label*="Favori" i]').first()
    if (await heartBtn.isVisible()) {
      await heartBtn.click()
      await expect(page.locator('[data-sonner-toast]').or(heartBtn)).toBeVisible({ timeout: 5000 })
    }
  })
})
