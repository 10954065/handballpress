import { test, expect } from '@playwright/test'
import { deleteLoginFailedAudits } from './test-db'

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? ''
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? ''

// A fixed non-existent address, not the real seeded admin — keeps the
// "wrong password" test from ever tripping the login rate limit on the
// real account. Its failed-attempt audit rows are cleaned up below so
// repeated local/CI runs don't accumulate and trip the IP-based limit.
const WRONG_PASSWORD_TEST_EMAIL = 'e2e-wrong-password-test@handballpressgh.com'

test.describe('admin authentication', () => {
  test.afterAll(async () => {
    await deleteLoginFailedAudits(WRONG_PASSWORD_TEST_EMAIL)
  })

  test('unauthenticated visitor is redirected from /admin to /admin/login', async ({ page }) => {
    await page.goto('/admin')
    await expect(page).toHaveURL(/\/admin\/login$/)
  })

  test('wrong password shows an error and does not grant access', async ({ page }) => {
    await page.goto('/admin/login')
    await page.getByLabel('Email').fill(WRONG_PASSWORD_TEST_EMAIL)
    await page.getByLabel('Password').fill('definitely-wrong-password')
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page.getByText(/invalid email or password/i)).toBeVisible()
    await expect(page).toHaveURL(/\/admin\/login$/)
  })

  test('correct credentials log in, reach the dashboard, and can log out', async ({ page }) => {
    test.skip(!ADMIN_EMAIL || !ADMIN_PASSWORD, 'SEED_ADMIN_EMAIL/PASSWORD not set for this run')

    await page.goto('/admin/login')
    await page.getByLabel('Email').fill(ADMIN_EMAIL)
    await page.getByLabel('Password').fill(ADMIN_PASSWORD)
    await page.getByRole('button', { name: 'Sign in' }).click()

    await expect(page).toHaveURL(/\/admin$/)
    await expect(page.getByRole('heading', { name: /welcome/i })).toBeVisible()

    await page.getByRole('button', { name: 'Sign out' }).click()
    await expect(page).toHaveURL(/\/admin\/login$/)

    await page.goto('/admin')
    await expect(page).toHaveURL(/\/admin\/login$/)
  })
})
