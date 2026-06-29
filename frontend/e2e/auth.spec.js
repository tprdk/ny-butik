import { test, expect } from '@playwright/test'

test.describe('Kimlik Doğrulama', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies()
  })

  test('giriş sayfası yüklenir', async ({ page }) => {
    await page.goto('/giris')
    await expect(page).toHaveTitle(/Giriş Yap/)
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('geçersiz e-posta ile giriş hata gösterir', async ({ page }) => {
    await page.goto('/giris')
    await page.fill('input[type="email"]', 'yanlis@test.com')
    await page.fill('input[type="password"]', 'YanlisŞifre1!')
    await page.click('button[type="submit"]')
    // Sonner toast
    await expect(page.locator('[data-sonner-toast]')).toBeVisible({ timeout: 6000 })
  })

  test('geçerli credentials ile giriş anasayfaya yönlendirir', async ({ page }) => {
    await page.goto('/giris')
    await page.fill('input[type="email"]', 'ayse@test.com')
    await page.fill('input[type="password"]', 'Sifre123!')
    await page.click('button[type="submit"]')
    await page.waitForURL('/', { timeout: 8000 })
    await expect(page).toHaveURL('/')
  })

  test('giriş yapmadan admin sayfası erişim engellenir', async ({ page }) => {
    await page.goto('/admin')
    await expect(page).not.toHaveURL('/admin/dashboard')
  })

  test('kayıt sayfası yüklenir', async ({ page }) => {
    await page.goto('/kayit')
    await expect(page).toHaveTitle(/Kayıt/)
  })

  test('kısa şifre ile kayıt hata gösterir', async ({ page }) => {
    await page.goto('/kayit')
    const emailInput = page.locator('input[type="email"]')
    const passwordInput = page.locator('input[type="password"]').first()

    if (await emailInput.isVisible()) {
      await emailInput.fill('yeni@test.com')
      await passwordInput.fill('123')
      await page.click('button[type="submit"]')
      // İlk hata mesajı — .first() ile strict mode violation engellenir
      await expect(page.locator('p.text-destructive').first()).toBeVisible({ timeout: 3000 })
    }
  })
})
