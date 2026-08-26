import { test, expect } from '@playwright/test'

test('homepage responds and renders a heading', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('h1')).toBeVisible()
})
