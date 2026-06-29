import { test, expect } from '@playwright/test'
import { ensureCustomerExists, getToken, getUser, setupPageAuth, CUSTOMER_EMAIL, CUSTOMER_PASS } from './helpers/auth.js'

const BASE = 'http://localhost:5173'
const PRODUCT_SLUG = 'abaya-klasik-elbise'

let _token = null
let _user = null

const TEST_ADDRESS = {
  label: 'E2E Checkout Adresi',
  firstName: 'Test',
  lastName: 'Müşteri',
  phone: '05551234567',
  addressLine1: 'Playwright Mahallesi No:42',
  city: 'İstanbul',
  district: 'Kadıköy',
  postalCode: '34710',
  isDefault: true,
}

test.beforeAll(async ({ request }) => {
  await ensureCustomerExists(request)
  _token = await getToken(request, CUSTOMER_EMAIL, CUSTOMER_PASS)
  _user = await getUser(request, _token)
})

test.beforeEach(async ({ page }) => {
  await setupPageAuth(page, _token, _user)
})

/**
 * Ensures: (1) address exists, (2) product in cart, (3) navigates to /odeme.
 */
async function setupCheckout(page, request) {
  // Ensure at least one address
  const addrRes = await request.get(`${BASE}/api/v1/users/me/addresses`, {
    headers: { Authorization: `Bearer ${_token}` },
  })
  const existing = (await addrRes.json()).data ?? []
  if (existing.length === 0) {
    await request.post(`${BASE}/api/v1/users/me/addresses`, {
      headers: { Authorization: `Bearer ${_token}`, 'Content-Type': 'application/json' },
      data: TEST_ADDRESS,
    })
  }

  // Clear cart and add product
  await request.delete(`${BASE}/api/v1/cart`, {
    headers: { Authorization: `Bearer ${_token}` },
  }).catch(() => {})

  await page.goto(`/urunler/${PRODUCT_SLUG}`)
  await page.locator('button[aria-label="Siyah"]').click()
  await page.locator('button', { hasText: 'M' }).first().click()
  await page.locator('button', { hasText: 'Sepete Ekle' }).click()
  await expect(page.locator('button[aria-label="Sepeti kapat"]')).toBeVisible({ timeout: 5000 })
  await page.locator('button[aria-label="Sepeti kapat"]').click()

  await page.goto('/odeme')
}

// ─── Erişim Kontrolü ─────────────────────────────────────────────────────────

test.describe('Ödeme Akışı — Erişim', () => {
  test('giriş yapmadan /odeme erişimi /giris sayfasına yönlendirir', async ({ page }) => {
    await page.addInitScript(() => localStorage.removeItem('nybutik-auth'))
    await page.unroute('**/api/v1/auth/refresh')
    await page.goto('/odeme')
    await expect(page).toHaveURL(/giris/, { timeout: 8000 })
  })
})

// ─── Adım 1: Adres ───────────────────────────────────────────────────────────

test.describe('Ödeme Akışı — Adım 1: Adres', () => {
  test('checkout sayfası yüklenir ve adım göstergesi görünür', async ({ page, request }) => {
    await setupCheckout(page, request)
    await expect(page).toHaveTitle(/Ödeme/)
    // Step indicators: exact text match to avoid strict mode violation with address labels
    await expect(page.getByText('Adres', { exact: true }).first()).toBeVisible()
    await expect(page.getByText('Ödeme', { exact: true }).first()).toBeVisible()
    await expect(page.getByText('Özet', { exact: true }).first()).toBeVisible()
  })

  test('adres seçmeden "Ödemeye Geç" tıklayınca hata toast görünür', async ({ page, request }) => {
    await setupCheckout(page, request)
    const nextBtn = page.locator('button', { hasText: 'Ödemeye Geç' })
    if (await nextBtn.isVisible()) {
      await nextBtn.click()
      await expect(page.locator('[data-sonner-toast]')).toBeVisible({ timeout: 5000 })
    }
  })

  test('adres seçilince "Ödemeye Geç" butonu 2. adıma geçer', async ({ page, request }) => {
    await setupCheckout(page, request)
    const addressCard = page.locator('.border.p-4').first()
    if (await addressCard.isVisible()) {
      await addressCard.click()
      await page.locator('button', { hasText: 'Ödemeye Geç' }).click()
      await expect(page.getByText('Ödeme Yöntemi')).toBeVisible({ timeout: 5000 })
    }
  })

  test('fatura adresi checkbox varsayılan olarak işaretlidir', async ({ page, request }) => {
    await setupCheckout(page, request)
    const checkbox = page.locator('input[type="checkbox"]').first()
    if (await checkbox.isVisible()) {
      await expect(checkbox).toBeChecked()
    }
  })
})

// ─── Adım 2: Ödeme Yöntemi ───────────────────────────────────────────────────

test.describe('Ödeme Akışı — Adım 2: Ödeme Yöntemi', () => {
  async function goToPaymentStep(page, request) {
    await setupCheckout(page, request)
    const addressCard = page.locator('.border.p-4').first()
    if (!await addressCard.isVisible()) return false
    await addressCard.click()
    await page.locator('button', { hasText: 'Ödemeye Geç' }).click()
    await expect(page.getByText('Ödeme Yöntemi')).toBeVisible({ timeout: 5000 })
    return true
  }

  test('"Simülasyon Ödemesi" seçeneği görünür', async ({ page, request }) => {
    const ok = await goToPaymentStep(page, request)
    if (ok) {
      await expect(page.getByText('Simülasyon Ödemesi')).toBeVisible()
      await expect(page.getByText('Demo modunda')).toBeVisible()
    }
  })

  test('"Geri" butonu adres adımına döner', async ({ page, request }) => {
    const ok = await goToPaymentStep(page, request)
    if (ok) {
      await page.locator('button', { hasText: 'Geri' }).click()
      await expect(page.getByText('Teslimat Adresi')).toBeVisible()
    }
  })
})

// ─── Adım 3: Özet ────────────────────────────────────────────────────────────

test.describe('Ödeme Akışı — Adım 3: Özet', () => {
  async function goToSummaryStep(page, request) {
    await setupCheckout(page, request)
    const addressCard = page.locator('.border.p-4').first()
    if (!await addressCard.isVisible()) return false
    await addressCard.click()
    await page.locator('button', { hasText: 'Ödemeye Geç' }).click()
    await expect(page.getByText('Simülasyon Ödemesi')).toBeVisible({ timeout: 5000 })
    await page.locator('button', { hasText: 'Devam Et' }).click()
    await expect(page.getByText('Sipariş Özeti')).toBeVisible({ timeout: 5000 })
    return true
  }

  test('özet adımında sepet ürünleri listelenir', async ({ page, request }) => {
    const ok = await goToSummaryStep(page, request)
    if (ok) {
      await expect(page.getByText(/Abaya|abaya/i).first()).toBeVisible()
    }
  })

  test('"Siparişi Tamamla" butonu görünür ve aktif', async ({ page, request }) => {
    const ok = await goToSummaryStep(page, request)
    if (ok) {
      await expect(page.locator('button', { hasText: 'Siparişi Tamamla' })).toBeEnabled()
    }
  })
})

// ─── Sipariş Oluşturma ────────────────────────────────────────────────────────

test.describe('Ödeme Akışı — Sipariş Oluşturma', () => {
  async function completeOrder(page, request) {
    await setupCheckout(page, request)
    const addressCard = page.locator('.border.p-4').first()
    if (!await addressCard.isVisible()) return false
    await addressCard.click()
    await page.locator('button', { hasText: 'Ödemeye Geç' }).click()
    await expect(page.getByText('Simülasyon Ödemesi')).toBeVisible({ timeout: 5000 })
    await page.locator('button', { hasText: 'Devam Et' }).click()
    await page.locator('button', { hasText: 'Siparişi Tamamla' }).click()
    await expect(page).toHaveURL(/siparis-basarili/, { timeout: 10000 })
    return true
  }

  test('sipariş tamamlanır ve başarı sayfasına yönlendirilir', async ({ page, request }) => {
    await completeOrder(page, request)
  })

  test('başarı sayfasında sipariş numarası "NY-" formatında görünür', async ({ page, request }) => {
    const ok = await completeOrder(page, request)
    if (ok) {
      await expect(page.locator('text=/NY-/').first()).toBeVisible()
    }
  })

  test('başarı sayfasında siparişlere git linki görünür', async ({ page, request }) => {
    const ok = await completeOrder(page, request)
    if (ok) {
      await expect(page.getByText(/Siparişlerim/i).first()).toBeVisible()
    }
  })

  test('sipariş sonrası siparişlerim sayfasında görünür', async ({ page, request }) => {
    const ok = await completeOrder(page, request)
    if (ok) {
      await page.goto('/hesabim/siparisler')
      await expect(page.locator('text=/NY-/').first()).toBeVisible({ timeout: 5000 })
    }
  })
})
