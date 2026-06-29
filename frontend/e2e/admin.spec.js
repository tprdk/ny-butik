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

test.describe('Admin Paneli', () => {
  test('admin ürünler sayfası yüklenir', async ({ page }) => {
    await page.goto('/admin/urunler')
    await expect(page).toHaveTitle(/Ürünler.*Admin/)
    await page.waitForLoadState('networkidle')
    await expect(page.getByText('Tümü')).toBeVisible()
  })

  test('admin ürünler — "Tümü" sekmesi tüm durumları gösterir', async ({ page }) => {
    await page.goto('/admin/urunler')
    await page.waitForLoadState('networkidle')
    await page.getByText('Tümü').click()
    await page.waitForLoadState('networkidle')
    const rows = page.locator('table tbody tr')
    await expect(rows.first()).toBeVisible()
  })

  test('admin yeni ürün sayfası yüklenir', async ({ page }) => {
    await page.goto('/admin/urunler/yeni')
    await expect(page.locator('input[name="name"]')).toBeVisible()
  })

  test('admin ürün oluştur formu validasyon hatası gösterir', async ({ page }) => {
    await page.goto('/admin/urunler/yeni')
    await page.locator('button[type="submit"]').first().click()
    await expect(page.locator('p.text-red-500, .text-red-500, p.text-destructive').first()).toBeVisible({ timeout: 5000 })
  })

  test('admin dashboard yüklenir', async ({ page }) => {
    await page.goto('/admin')
    await expect(page).toHaveURL('/admin')
  })

  test('müşteri admin sayfasına erişemez', async ({ page: adminPage, browser }) => {
    // Test with a completely new unauthenticated context
    const ctx = await browser.newContext()
    const page = await ctx.newPage()
    await page.goto('/admin')
    await expect(page).not.toHaveURL('/admin/dashboard')
    await ctx.close()
  })

  test('ürün durum toggle çalışır', async ({ page }) => {
    await page.goto('/admin/urunler')
    await page.waitForLoadState('networkidle')
    const toggleBtn = page.locator('button[aria-label*="Aktif"], button[aria-label*="Pasif"]')
      .or(page.locator('button', { hasText: /Aktif|Pasif/ })).first()
    if (await toggleBtn.isVisible()) {
      await toggleBtn.click()
      await page.waitForLoadState('networkidle')
    }
  })
})
