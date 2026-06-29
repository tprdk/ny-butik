import { test, expect } from '@playwright/test'
import { ensureCustomerExists, getToken, getUser, setupPageAuth, CUSTOMER_EMAIL, CUSTOMER_PASS } from './helpers/auth.js'

const PRODUCT_SLUG = 'abaya-klasik-elbise'
const PRODUCT_SLUG_2 = 'yesil-elbise'
const BASE = 'http://localhost:5173'

let _token = null
let _user = null

async function clearCustomerCart(request) {
  if (!_token) return
  await request.delete(`${BASE}/api/v1/cart`, {
    headers: { Authorization: `Bearer ${_token}` },
  }).catch(() => {})
}

async function addProductToCart(page, slug, color, size) {
  await page.goto(`/urunler/${slug}`)
  await page.locator(`button[aria-label="${color}"]`).click()
  await page.locator('button', { hasText: size }).first().click()
  await page.locator('button', { hasText: 'Sepete Ekle' }).click()
  await expect(page.locator('button[aria-label="Sepeti kapat"]')).toBeVisible({ timeout: 5000 })
}

test.describe('Sepet', () => {
  test.beforeAll(async ({ request }) => {
    await ensureCustomerExists(request)
    _token = await getToken(request, CUSTOMER_EMAIL, CUSTOMER_PASS)
    _user = await getUser(request, _token)
  })

  test.beforeEach(async ({ page, request }) => {
    await clearCustomerCart(request)
    await setupPageAuth(page, _token, _user)
  })

  // ─── Sepet Sayfası (giriş gerektirmez) ───────────────────────────────────

  test('boş sepet sayfası yüklenir ve mesaj gösterir', async ({ page }) => {
    await page.goto('/sepet')
    await expect(page).toHaveTitle(/Sepetim/)
    await expect(page.getByText('Sepetiniz boş')).toBeVisible()
    await expect(page.getByText('Alışverişe Başla')).toBeVisible()
  })

  test('"Alışverişe Devam Et" linki ürünler sayfasına götürür', async ({ page }) => {
    await page.goto('/sepet')
    await page.getByText('Alışverişe Devam Et').click()
    await expect(page).toHaveURL('/urunler')
  })

  // ─── Cart Drawer ──────────────────────────────────────────────────────────

  test('header sepet butonu drawer açar', async ({ page }) => {
    await page.goto('/')
    await page.locator('button[aria-label="Sepet"]').click()
    await expect(page.locator('button[aria-label="Sepeti kapat"]')).toBeVisible()
  })

  test('drawer kapatma butonu drawer kapatır', async ({ page }) => {
    await page.goto('/')
    await page.locator('button[aria-label="Sepet"]').click()
    await page.locator('button[aria-label="Sepeti kapat"]').click()
    await expect(page.locator('button[aria-label="Sepeti kapat"]')).not.toBeVisible()
  })

  test('boş drawer "sepetiniz boş" mesajı gösterir', async ({ page }) => {
    await page.goto('/')
    await page.locator('button[aria-label="Sepet"]').click()
    await expect(page.getByText('Sepetiniz boş')).toBeVisible()
  })

  // ─── Ürün Detay → Sepete Ekle ────────────────────────────────────────────

  test('ürün detay sayfasında renk ve beden seçimi görünür', async ({ page }) => {
    await page.goto(`/urunler/${PRODUCT_SLUG}`)
    await expect(page.locator('button[aria-label="Siyah"]')).toBeVisible()
    await expect(page.locator('button', { hasText: 'M' }).first()).toBeVisible()
  })

  test('renk ve beden seçilmeden add butonu devre dışıdır', async ({ page }) => {
    await page.goto(`/urunler/${PRODUCT_SLUG}`)
    await expect(page.locator('button', { hasText: 'Beden Seçin' })).toBeDisabled({ timeout: 5000 })
  })

  test('renk ve beden seçince "Sepete Ekle" aktif olur', async ({ page }) => {
    await page.goto(`/urunler/${PRODUCT_SLUG}`)
    await page.locator('button[aria-label="Siyah"]').click()
    await page.locator('button', { hasText: 'M' }).first().click()
    await expect(page.locator('button', { hasText: 'Sepete Ekle' })).toBeEnabled()
  })

  test('ürün sepete eklenir ve drawer açılır', async ({ page }) => {
    await addProductToCart(page, PRODUCT_SLUG, 'Siyah', 'M')
    await expect(page.locator('button[aria-label="Sepeti kapat"]')).toBeVisible()
  })

  test('sepete eklenen ürün drawer içinde görünür', async ({ page }) => {
    await addProductToCart(page, PRODUCT_SLUG, 'Siyah', 'M')
    await expect(page.getByText(/Abaya|abaya|Klasik/i).first()).toBeVisible()
  })

  test('drawer içindeki "Sepeti Görüntüle" butonu sepet sayfasına götürür', async ({ page }) => {
    await addProductToCart(page, PRODUCT_SLUG, 'Siyah', 'M')
    await page.getByText('Sepeti Görüntüle').click()
    await expect(page).toHaveURL('/sepet')
  })

  // ─── Sepet Sayfası — Dolu Sepet ───────────────────────────────────────────

  test('dolu sepette "Ödemeye Geç" butonu görünür', async ({ page }) => {
    await addProductToCart(page, PRODUCT_SLUG, 'Siyah', 'M')
    await page.goto('/sepet')
    await expect(page.getByText('Ödemeye Geç')).toBeVisible()
  })

  test('sepet sayfasında miktar artır / azalt butonları çalışır', async ({ page }) => {
    await addProductToCart(page, PRODUCT_SLUG, 'Siyah', 'M')
    await page.goto('/sepet')
    const plusBtn = page.locator('button[aria-label="Artır"]').first()
    await expect(plusBtn).toBeVisible()
    await Promise.all([
      page.waitForResponse(resp => resp.url().includes('/cart/items/') && resp.status() === 200),
      plusBtn.click(),
    ])
    await expect(page.locator('.w-7').first()).toHaveText('2')
  })

  test('sepet sayfasında ürün kaldırılabilir', async ({ page }) => {
    await addProductToCart(page, PRODUCT_SLUG, 'Siyah', 'M')
    await page.goto('/sepet')
    await expect(page.getByText(/Sepetim/)).toBeVisible()
    await page.locator('button[aria-label="Kaldır"]').first().click()
    await expect(page.getByText('Sepetiniz boş')).toBeVisible({ timeout: 6000 })
  })

  test('geçersiz kupon kodu hata mesajı gösterir', async ({ page }) => {
    await addProductToCart(page, PRODUCT_SLUG, 'Siyah', 'M')
    await page.goto('/sepet')
    const couponInput = page.locator('input[placeholder*="kupon" i]')
      .or(page.locator('input[name="coupon"]')).first()
    if (await couponInput.isVisible()) {
      await couponInput.fill('GECERSIZ123')
      await page.locator('button', { hasText: /Uygula|Ekle/i }).first().click()
      await expect(page.locator('text=/geçersiz|bulunamadı|uygulanamadı/i').first()).toBeVisible({ timeout: 5000 })
    }
  })

  // ─── İkinci ürün ─────────────────────────────────────────────────────────

  test('farklı ürün (Yeşil Elbise) sepete eklenebilir', async ({ page }) => {
    await addProductToCart(page, PRODUCT_SLUG_2, 'Yeşil', 'M')
    await expect(page.getByText(/Yeşil|yesil/i).first()).toBeVisible()
  })

  test('iki farklı ürün sepette birlikte görünür', async ({ page }) => {
    await addProductToCart(page, PRODUCT_SLUG, 'Siyah', 'M')
    await page.locator('button[aria-label="Sepeti kapat"]').click()
    await addProductToCart(page, PRODUCT_SLUG_2, 'Yeşil', 'M')
    await page.goto('/sepet')
    await expect(page.getByText(/Abaya|Klasik/i).first()).toBeVisible()
    await expect(page.getByText(/Yeşil/i).first()).toBeVisible()
  })

  test('sepet sayfasında toplam fiyat görünür', async ({ page }) => {
    await addProductToCart(page, PRODUCT_SLUG, 'Siyah', 'M')
    await page.goto('/sepet')
    await expect(page.locator('text=/₺/')).toBeVisible()
  })
})
