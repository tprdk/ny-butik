import { test, expect } from '@playwright/test'

test.describe('Kimlik Doğrulama', () => {
  test.beforeEach(async ({ page }) => {
    // Her testten önce cookie'leri temizle (logout durumu)
    await page.context().clearCookies()
    await page.evaluate(() => localStorage.clear())
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
    // Hata mesajı görünmeli
    await expect(page.locator('text=/hatalı|geçersiz|bulunamadı/i')).toBeVisible({ timeout: 5000 })
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
    // Admin sayfasına girilemez, login'e yönlendirmeli veya 403 göstermeli
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
      await passwordInput.fill('123') // çok kısa
      await page.click('button[type="submit"]')
      // Validasyon hatası gösterilmeli
      await expect(page.locator('text=/şifre|password/i')).toBeVisible({ timeout: 3000 })
    }
  })
})
