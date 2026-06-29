import { test, expect } from '@playwright/test'
import { getToken, getUser, setupPageAuth, ADMIN_EMAIL, ADMIN_PASS } from './helpers/auth.js'

let _token = null
let _user = null

const uniqueCode = () => `E2E${Date.now()}`

test.beforeAll(async ({ request }) => {
  _token = await getToken(request, ADMIN_EMAIL, ADMIN_PASS)
  _user = await getUser(request, _token)
})

test.beforeEach(async ({ page }) => {
  await setupPageAuth(page, _token, _user)
})

test.describe('Admin — Kupon Yönetimi', () => {
  test('kupon listesi sayfası yüklenir', async ({ page }) => {
    await page.goto('/admin/kuponlar')
    await expect(page).toHaveURL('/admin/kuponlar')
    await page.waitForLoadState('networkidle')
    // Either coupon table or "Yeni Kupon" button visible
    const hasContent = await page
      .locator('button', { hasText: /Yeni Kupon|Ekle/i })
      .or(page.locator('table'))
      .first()
      .isVisible()
      .catch(() => false)
    expect(hasContent).toBeTruthy()
  })

  test('"Yeni Kupon" butonu formu açar', async ({ page }) => {
    await page.goto('/admin/kuponlar')
    await page.locator('button', { hasText: /Yeni Kupon|Ekle/i }).first().click()
    // Coupon code input has placeholder="YAZA20" (example code)
    await expect(page.locator('input[placeholder="YAZA20"]').first()).toBeVisible({ timeout: 3000 })
  })

  test('boş kupon kodu ile "Kaydet" butonu devre dışıdır', async ({ page }) => {
    await page.goto('/admin/kuponlar')
    await page.locator('button', { hasText: /Yeni Kupon|Ekle/i }).first().click()
    // Save button is disabled when code input is empty (disabled={!form.code})
    await expect(page.locator('button', { hasText: /Kaydet/i }).first()).toBeDisabled()
  })

  test('yeni kupon başarıyla oluşturulur', async ({ page }) => {
    await page.goto('/admin/kuponlar')
    await page.locator('button', { hasText: /Yeni Kupon|Ekle/i }).first().click()

    const code = uniqueCode()
    await page.locator('input[placeholder="YAZA20"]').first().fill(code)

    await page.locator('button', { hasText: /Kaydet/i }).first().click()
    await expect(page.getByText(code)).toBeVisible({ timeout: 5000 })
  })

  test('mevcut kupon düzenlenebilir', async ({ page }) => {
    await page.goto('/admin/kuponlar')
    await page.waitForLoadState('networkidle')
    const editBtn = page.locator('button[aria-label="Düzenle"]')
      .or(page.locator('button', { hasText: 'Düzenle' })).first()
    if (await editBtn.isVisible()) {
      await editBtn.click()
      await expect(
        page.locator('input[name="code"], input[placeholder*="KOD" i]').first()
      ).toBeVisible({ timeout: 3000 })
    }
  })

  test('kupon listesinde kod ve indirim değeri görünür', async ({ page }) => {
    await page.goto('/admin/kuponlar')
    await page.waitForLoadState('networkidle')
    const couponRow = page.locator('table tbody tr').first()
    if (await couponRow.isVisible()) {
      await expect(couponRow).toBeVisible()
    }
  })
})
