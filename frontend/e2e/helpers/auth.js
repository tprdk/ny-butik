export const ADMIN_EMAIL = 'ayse@test.com'
export const ADMIN_PASS = 'Sifre123!'

export const CUSTOMER_EMAIL = 'e2e.musteri@nybutik.test'
export const CUSTOMER_PASS = 'E2eMusteri1!'

const BASE = 'http://localhost:5173'

/**
 * Logs in via the /giris page and waits for redirect to /.
 * Use only when testing the login flow itself — this consumes the rate limit.
 */
export async function loginAs(page, email, password) {
  await page.goto('/giris')
  await page.fill('input[type="email"]', email)
  await page.fill('input[type="password"]', password)
  await page.click('button[type="submit"]')
  await page.waitForURL('/', { timeout: 8000 })
}

export const loginAsAdmin = (page) => loginAs(page, ADMIN_EMAIL, ADMIN_PASS)
export const loginAsCustomer = (page) => loginAs(page, CUSTOMER_EMAIL, CUSTOMER_PASS)

/**
 * Registers the test customer via API. Safe to call multiple times — 409 / 429 are fine.
 */
export async function ensureCustomerExists(request) {
  const res = await request.post(`${BASE}/api/v1/auth/register`, {
    data: {
      firstName: 'Test',
      lastName: 'Müşteri',
      email: CUSTOMER_EMAIL,
      password: CUSTOMER_PASS,
    },
  })
  // 201 = created, 409 = already exists, 429 = rate limited (assume exists from prior run)
  if (![201, 409, 429].includes(res.status())) {
    throw new Error(`Test müşterisi oluşturulamadı: ${res.status()}`)
  }
}

/**
 * Returns a Bearer accessToken for the given credentials (API-level call).
 */
export async function getToken(request, email, password) {
  const res = await request.post(`${BASE}/api/v1/auth/login`, {
    data: { email, password },
  })
  const body = await res.json()
  return body.data.accessToken
}

/**
 * Returns the user profile for a given Bearer token.
 */
export async function getUser(request, token) {
  const res = await request.get(`${BASE}/api/v1/users/me`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return (await res.json()).data
}

/**
 * Sets up authenticated state for a Playwright page WITHOUT triggering real login or
 * refresh-token rotation. Uses two mechanisms:
 *
 *  1. addInitScript — injects the Zustand-persisted user into localStorage before React mounts.
 *  2. page.route  — intercepts the refresh endpoint and returns `token` directly.
 *
 * This means useAuthInit finds `user` in localStorage, calls refresh (intercepted), gets
 * `token`, sets it in memory and marks initialized=true — all without touching the real
 * refresh-token cookie.
 *
 * Call this in beforeEach BEFORE page.goto().
 */
export async function setupPageAuth(page, token, user) {
  // (1) Pre-populate Zustand localStorage state with the user object
  await page.addInitScript((u) => {
    localStorage.setItem('nybutik-auth', JSON.stringify({ state: { user: u }, version: 0 }))
  }, user)

  // (2) Intercept refresh so it always returns our cached token
  await page.route('**/api/v1/auth/refresh', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: { accessToken: token } }),
    })
  })
}
