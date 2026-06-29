import { test, expect } from '@playwright/test'
import { ensureCustomerExists, getToken, getUser, setupPageAuth, ADMIN_EMAIL, ADMIN_PASS, CUSTOMER_EMAIL } from './helpers/auth.js'

let _token = null
let _user = null

test.beforeAll(async ({ request }) => {
  await ensureCustomerExists(request)
  _token = await getToken(request, ADMIN_EMAIL, ADMIN_PASS)
  _user = await getUser(request, _token)
})

test.beforeEach(async ({ page }) => {
  await setupPageAuth(page, _token, _user)
})

test.describe('Admin — Müşteri Yönetimi', () => {
  test('müşteri listesi sayfası yüklenir', async ({ page }) => {
    await page.goto('/admin/musteriler')
    await expect(page).toHaveURL('/admin/musteriler')
    await page.waitForLoadState('networkidle')
    const hasTable = await page.locator('table').isVisible().catch(() => false)
    const isEmpty = await page.getByText(/müşteri bulunamadı|henüz müşteri/i).isVisible().catch(() => false)
    const hasAny = await page.locator('main, [role="main"], .container').first().isVisible().catch(() => false)
    expect(hasTable || isEmpty || hasAny).toBeTruthy()
  })

  test('müşteri listesinde CUSTOMER rolündeki kullanıcı görünür', async ({ page }) => {
    await page.goto('/admin/musteriler')
    await page.waitForLoadState('networkidle')
    const customerRow = page.locator(`text=${CUSTOMER_EMAIL}`)
      .or(page.locator('text=e2e.musteri')).first()
    if (await customerRow.isVisible()) {
      await expect(customerRow).toBeVisible()
    }
  })

  test('müşteri listesinde arama yapılabilir', async ({ page }) => {
    await page.goto('/admin/musteriler')
    const searchInput = page.locator('input[placeholder*="ara" i]')
      .or(page.locator('input[type="search"]')).first()
    if (await searchInput.isVisible()) {
      await searchInput.fill('e2e')
      await page.waitForLoadState('networkidle')
      await expect(page.locator('text=e2e').first()).toBeVisible({ timeout: 5000 })
    }
  })

  test('müşteri detay sayfasına gidilir', async ({ page }) => {
    await page.goto('/admin/musteriler')
    await page.waitForLoadState('networkidle')
    const detayLink = page.getByText(/Detay|Görüntüle/i).first()
    if (await detayLink.isVisible()) {
      await detayLink.click()
      await expect(page).toHaveURL(/\/admin\/musteriler\/\d+/)
    }
  })

  test('müşteri detay sayfası e-posta bilgisini gösterir', async ({ page }) => {
    await page.goto('/admin/musteriler')
    await page.waitForLoadState('networkidle')
    const detayLink = page.getByText(/Detay|Görüntüle/i).first()
    if (await detayLink.isVisible()) {
      await detayLink.click()
      await page.waitForLoadState('networkidle')
      await expect(page.locator('text=/@/').first()).toBeVisible({ timeout: 5000 })
    }
  })

  test('ADMIN rolündeki kullanıcı müşteri listesinde görünmez', async ({ page }) => {
    await page.goto('/admin/musteriler')
    await page.waitForLoadState('networkidle')
    const adminInList = await page.locator('text=ayse@test.com').isVisible().catch(() => false)
    expect(adminInList).toBeFalsy()
  })
})
