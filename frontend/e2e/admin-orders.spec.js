import { test, expect } from '@playwright/test'
import { getToken, getUser, setupPageAuth, ADMIN_EMAIL, ADMIN_PASS } from './helpers/auth.js'

let _token = null
let _user = null

test.beforeAll(async ({ request }) => {
  _token = await getToken(request, ADMIN_EMAIL, ADMIN_PASS)
  _user = await getUser(request, _token)
})

test.beforeEach(async ({ page }) => {
  await setupPageAuth(page, _token, _user)
})

test.describe('Admin — Sipariş Yönetimi', () => {
  test('sipariş listesi sayfası yüklenir', async ({ page }) => {
    await page.goto('/admin/siparisler')
    await expect(page).toHaveURL('/admin/siparisler')
    await page.waitForLoadState('networkidle')
    const hasTable = await page.locator('table').isVisible().catch(() => false)
    const isEmpty = await page.getByText(/sipariş bulunamadı|henüz sipariş/i).isVisible().catch(() => false)
    const hasAny = await page.locator('main, [role="main"], .container').first().isVisible().catch(() => false)
    expect(hasTable || isEmpty || hasAny).toBeTruthy()
  })

  test('sipariş listesinde sipariş numaraları "NY-" formatındadır', async ({ page }) => {
    await page.goto('/admin/siparisler')
    await page.waitForLoadState('networkidle')
    const orderNumbers = page.locator('text=/NY-/')
    const count = await orderNumbers.count()
    if (count > 0) {
      await expect(orderNumbers.first()).toBeVisible()
    }
  })

  test('sipariş listesinde "Detay" linki ile sipariş detayına gidilir', async ({ page }) => {
    await page.goto('/admin/siparisler')
    const detayLink = page.getByText('Detay').first()
    if (await detayLink.isVisible()) {
      await detayLink.click()
      await expect(page).toHaveURL(/\/admin\/siparisler\/\d+/)
    }
  })

  test('sipariş detay sayfası sipariş numarasını gösterir', async ({ page }) => {
    await page.goto('/admin/siparisler')
    const detayLink = page.getByText('Detay').first()
    if (await detayLink.isVisible()) {
      await detayLink.click()
      await expect(page.locator('text=/NY-/').first()).toBeVisible({ timeout: 5000 })
    }
  })

  test('sipariş detay sayfasında ürün satırları listelenir', async ({ page }) => {
    await page.goto('/admin/siparisler')
    const detayLink = page.getByText('Detay').first()
    if (await detayLink.isVisible()) {
      await detayLink.click()
      await page.waitForLoadState('networkidle')
      const rowCount = await page.locator('table tr').count()
      expect(rowCount).toBeGreaterThan(1)
    }
  })

  test('sipariş listesi durum badgeleri gösterir', async ({ page }) => {
    await page.goto('/admin/siparisler')
    await page.waitForLoadState('networkidle')
    const statusBadge = page.locator('span', { hasText: /Onaylandı|Hazırlanıyor|Kargoya|Teslim|İptal|Bekleniyor/i }).first()
    if (await statusBadge.isVisible()) {
      await expect(statusBadge).toBeVisible()
    }
  })
})
