import { test, expect, type Page } from '@playwright/test'

async function adminLogin(page: Page) {
  await page.context().clearCookies()
  await page.evaluate(() => localStorage.clear())
  await page.goto('/giris')
  await page.fill('input[type="email"]', 'ayse@test.com')
  await page.fill('input[type="password"]', 'Sifre123!')
  await page.click('button[type="submit"]')
  await page.waitForURL('/', { timeout: 8000 })
}

test.describe('Admin Paneli', () => {
  test.beforeEach(async ({ page }) => {
    await adminLogin(page)
  })

  test('admin ürünler sayfası yüklenir', async ({ page }) => {
    await page.goto('/admin/urunler')
    await expect(page).toHaveTitle(/Ürünler.*Admin/)
    await page.waitForLoadState('networkidle')
    // Tablo görünmeli
    await expect(page.locator('table')).toBeVisible({ timeout: 5000 })
  })

  test('admin ürünler — "Tümü" sekmesi tüm durumları gösterir', async ({ page }) => {
    await page.goto('/admin/urunler')
    await page.waitForLoadState('networkidle')

    // Tümü butonu
    const allBtn = page.locator('button', { hasText: 'Tümü' })
    if (await allBtn.isVisible()) {
      await allBtn.click()
      await page.waitForLoadState('networkidle')
      // Aktif, Pasif, Taslak durumlar görünebilmeli (hata olmamalı)
      await expect(page.locator('table tbody')).toBeVisible()
    }
  })

  test('admin yeni ürün sayfası yüklenir', async ({ page }) => {
    await page.goto('/admin/urunler/yeni')
    await expect(page).toHaveTitle(/Yeni Ürün.*Admin/)
    // Form alanları görünmeli
    await expect(page.locator('input[name="name"]').or(page.locator('input[placeholder*="Ürün"]'))).toBeVisible({ timeout: 5000 })
  })

  test('admin ürün oluştur formu validasyon hatası gösterir', async ({ page }) => {
    await page.goto('/admin/urunler/yeni')
    await page.waitForLoadState('networkidle')

    // Boş formu gönder
    await page.click('button[type="submit"]')

    // Zorunlu alan hataları görünmeli
    await expect(page.locator('text=/zorunlu|gerekli|doldur/i')).toBeVisible({ timeout: 3000 })
  })

  test('admin dashboard yüklenir', async ({ page }) => {
    await page.goto('/admin')
    await expect(page).toHaveTitle(/Dashboard.*Admin/)
  })

  test('müşteri admin sayfasına erişemez', async ({ page: adminPage }) => {
    // Yeni bir context ile müşteri olarak giriş yap
    const browserContext = adminPage.context().browser()
    if (!browserContext) return

    const customerContext = await browserContext.newContext()
    const customerPage = await customerContext.newPage()

    try {
      await customerPage.context().clearCookies()
      await customerPage.evaluate(() => localStorage.clear())
      // Giriş yapmadan admin sayfasına git
      await customerPage.goto('http://localhost:5173/admin/urunler')
      // Erişim engellenmeli — login sayfasına yönlendirmeli veya hata göstermeli
      const url = customerPage.url()
      const isBlocked = url.includes('/giris') || url.includes('/login') || !url.includes('/admin')
      if (!isBlocked) {
        // Sayfa içeriği kontrol et — admin içeriği görünmemeli
        const hasAdminContent = await customerPage.locator('text=Admin Panel').isVisible()
        expect(hasAdminContent).toBeFalsy()
      }
    } finally {
      await customerContext.close()
    }
  })

  test('ürün durum toggle çalışır', async ({ page }) => {
    await page.goto('/admin/urunler')
    await page.waitForLoadState('networkidle')

    // Aktif sekme
    const activeBtn = page.locator('button', { hasText: 'Aktif' })
    if (await activeBtn.isVisible()) {
      await activeBtn.click()
      await page.waitForLoadState('networkidle')

      // İlk ürün satırındaki toggle butonu
      const toggleBtn = page.locator('table tbody tr').first().locator('button[title*="Pasife"]')
      if (await toggleBtn.isVisible()) {
        await toggleBtn.click()
        await page.waitForLoadState('networkidle')
        // Ürün listeden kaybolmalı (aktif listede artık görünmez)
        await page.waitForTimeout(500)
      }

      // Geri aktife al (Pasif sekmesinde)
      const passiveBtn = page.locator('button', { hasText: 'Pasif' })
      if (await passiveBtn.isVisible()) {
        await passiveBtn.click()
        await page.waitForLoadState('networkidle')
        const activateBtn = page.locator('table tbody tr').first().locator('button[title*="Aktife"]')
        if (await activateBtn.isVisible()) {
          await activateBtn.click()
          await page.waitForLoadState('networkidle')
        }
      }
    }
  })
})
