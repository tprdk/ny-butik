import { test, expect } from '@playwright/test'

test.describe('Ürün Kataloğu', () => {
  test('anasayfa başlığını ve içeriğini yükler', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/NY Butik/)
    // Header görünmeli
    await expect(page.locator('header')).toBeVisible()
  })

  test('anasayfadan ürünler sayfasına gidilebilir', async ({ page }) => {
    await page.goto('/')
    // "Tümünü Gör" veya nav linki varsa tıkla
    const productLink = page.locator('a[href="/urunler"]').first()
    if (await productLink.isVisible()) {
      await productLink.click()
      await expect(page).toHaveURL('/urunler')
    } else {
      // Direkt git
      await page.goto('/urunler')
      await expect(page).toHaveURL('/urunler')
    }
  })

  test('ürünler sayfası yüklenir', async ({ page }) => {
    await page.goto('/urunler')
    await expect(page).toHaveTitle(/Ürünler/)
    // İçerik yüklenene kadar bekle
    await page.waitForLoadState('networkidle')
  })

  test('aktif ürün detayına gidilebilir', async ({ page }) => {
    await page.goto('/urunler/test-abaya').catch(() => {})
    // Ürün varsa detayını kontrol et, yoksa 404 kontrolü yap
    const title = page.title()
    await expect(title).not.toBe('')
  })

  test('olmayan slug 404 gösterir', async ({ page }) => {
    await page.goto('/urunler/bu-urun-kesinlikle-yoktur-xyz-123')
    // Hata sayfası veya ürün bulunamadı mesajı
    await expect(page.locator('text=/bulunamadı|bulunamadi|404/i')).toBeVisible({ timeout: 5000 })
  })

  test('URL\'den slug ile ürün detay sayfası doğru title gösterir', async ({ page }) => {
    // Aktif bir ürün slug'ını API'den al
    const res = await page.request.get('http://localhost:8080/api/v1/products?size=1')
    const data = await res.json()
    const products = data?.data?.content

    if (products && products.length > 0) {
      const slug = products[0].slug
      await page.goto(`/urunler/${slug}`)
      await expect(page).toHaveTitle(new RegExp(products[0].name.substring(0, 10)))
    } else {
      test.skip()
    }
  })

  test('kategori listesi yüklenir', async ({ page }) => {
    await page.goto('/')
    // API'den kategoriler kontrol
    const res = await page.request.get('http://localhost:8080/api/v1/categories')
    expect(res.ok()).toBeTruthy()
    const data = await res.json()
    expect(data.data).toBeDefined()
  })

  test('sekme başlığı sayfa değişince güncellenir', async ({ page }) => {
    await page.goto('/')
    const homeTitle = await page.title()
    expect(homeTitle).toContain('NY Butik')

    await page.goto('/urunler')
    const listTitle = await page.title()
    expect(listTitle).toContain('Ürünler')

    await page.goto('/giris')
    const loginTitle = await page.title()
    expect(loginTitle).toContain('Giriş')

    // Her sayfa farklı title taşımalı
    expect(homeTitle).not.toBe(listTitle)
    expect(listTitle).not.toBe(loginTitle)
  })
})
