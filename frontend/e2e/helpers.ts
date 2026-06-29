import { type Page } from '@playwright/test'

const BASE_URL = 'http://localhost:8080/api/v1'

export async function loginAsAdmin(page: Page) {
  await page.request.post(`${BASE_URL}/auth/login`, {
    data: { email: 'ayse@test.com', password: 'Sifre123!' },
  })

  await page.goto('/giris')
  await page.fill('input[name="email"], input[type="email"]', 'ayse@test.com')
  await page.fill('input[name="password"], input[type="password"]', 'Sifre123!')
  await page.click('button[type="submit"]')
  await page.waitForURL('/', { timeout: 5000 })
}

export async function loginAsUser(page: Page, email: string, password: string) {
  await page.goto('/giris')
  await page.fill('input[name="email"], input[type="email"]', email)
  await page.fill('input[name="password"], input[type="password"]', password)
  await page.click('button[type="submit"]')
}
