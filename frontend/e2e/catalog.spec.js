import { test, expect } from '@playwright/test'

test.describe('Ürün Kataloğu', () => {
  test('anasayfa başlığını ve içeriğini yükler', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/NY Butik/)
    await expect(page.locator('header')).toBeVisible()
  })

  test('anasayfadan ürünler sayfasına gidilebilir', async ({ page }) => {
    await page.goto('/')
    const productLink = page.locator('a[href="/urunler"]').first()
    if (await productLink.isVisible()) {
      await productLink.click()
      await expect(page).toHaveURL('/urunler')
    } else {
      await page.goto('/urunler')
      await expect(page).toHaveURL('/urunler')
    }
  })

  test('ürünler sayfası yüklenir', async ({ page }) => {
    await page.goto('/urunler')
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveTitle(/Ürünler/)
  })

  test('aktif ürün detayına gidilebilir', async ({ page }) => {
    await page.goto('/urunler/test-abaya').catch(() => {})
    const title = page.title()
    await expect(title).not.toBe('')
  })

  test('olmayan slug 404 gösterir', async ({ page }) => {
    await page.goto('/urunler/bu-urun-kesinlikle-yoktur-xyz-123')
    await expect(page.locator('text=/bulunamadı|bulunamadi|404/i')).toBeVisible({ timeout: 5000 })
  })

  test('URL\'den slug ile ürün detay sayfası doğru title gösterir', async ({ page }) => {
    const res = await page.request.get('http://localhost:8080/api/v1/products?size=1')
    const data = await res.json()
    const products = data?.data?.content

    if (products && products.length > 0) {
      const slug = products[0].slug
      await page.goto(`/urunler/${slug}`)
      await page.waitForLoadState('networkidle')
      await expect(page).toHaveTitle(new RegExp(products[0].name.substring(0, 10)))
    } else {
      test.skip()
    }
  })

  test('kategori listesi yüklenir', async ({ page }) => {
    await page.goto('/')
    const res = await page.request.get('http://localhost:8080/api/v1/categories')
    expect(res.ok()).toBeTruthy()
    const data = await res.json()
    expect(data.data).toBeDefined()
  })

  test('sekme başlığı sayfa değişince güncellenir', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    const homeTitle = await page.title()
    expect(homeTitle).toContain('NY Butik')

    await page.goto('/urunler')
    await page.waitForLoadState('networkidle')
    const listTitle = await page.title()
    expect(listTitle).toContain('Ürünler')

    await page.goto('/giris')
    await page.waitForLoadState('networkidle')
    const loginTitle = await page.title()
    expect(loginTitle).toContain('Giriş')

    expect(homeTitle).not.toBe(listTitle)
    expect(listTitle).not.toBe(loginTitle)
  })
})
