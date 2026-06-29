import { chromium } from '@playwright/test'
import { ADMIN_EMAIL, ADMIN_PASS, CUSTOMER_EMAIL, CUSTOMER_PASS } from './helpers/auth.js'
import { mkdirSync } from 'fs'

const BASE = 'http://localhost:5173'
const AUTH_DIR = 'e2e/.auth'

async function saveAuthState(browser, email, password, stateFile) {
  const context = await browser.newContext()
  const page = await context.newPage()
  await page.goto(`${BASE}/giris`)
  await page.fill('input[type="email"]', email)
  await page.fill('input[type="password"]', password)
  await page.click('button[type="submit"]')
  await page.waitForURL(`${BASE}/`, { timeout: 10000 })
  await context.storageState({ path: stateFile })
  await context.close()
}

export default async function globalSetup() {
  mkdirSync(AUTH_DIR, { recursive: true })

  // Register test customer (idempotent)
  const res = await fetch(`${BASE}/api/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      firstName: 'Test',
      lastName: 'Müşteri',
      email: CUSTOMER_EMAIL,
      password: CUSTOMER_PASS,
    }),
  })
  // 201 = created, 409 = exists, 429 = rate limited (assume exists) — all acceptable
  if (![201, 409, 429].includes(res.status)) {
    throw new Error(`Test müşterisi oluşturulamadı: ${res.status}`)
  }

  const browser = await chromium.launch()

  await saveAuthState(browser, ADMIN_EMAIL, ADMIN_PASS, `${AUTH_DIR}/admin.json`)
  await saveAuthState(browser, CUSTOMER_EMAIL, CUSTOMER_PASS, `${AUTH_DIR}/customer.json`)

  await browser.close()
}
