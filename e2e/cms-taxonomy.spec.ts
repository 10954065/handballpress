import path from 'node:path'
import { test, expect } from '@playwright/test'
import {
  deleteMediaByAltText,
  deleteTestAuthorsByPrefix,
  deleteTestCategoriesByPrefix,
  deleteTestTagsByPrefix,
} from './test-db'

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? ''
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? ''

const TEST_CATEGORY_PREFIX = 'E2E Category '
const TEST_TAG_PREFIX = 'e2e-tag-'
const TEST_AUTHOR_PREFIX = 'E2E Author '
const TEST_MEDIA_ALT_TEXT = 'e2e-test-upload'

test.describe('CMS taxonomy management', () => {
  test.skip(!ADMIN_EMAIL || !ADMIN_PASSWORD, 'SEED_ADMIN_EMAIL/PASSWORD not set for this run')

  test.afterAll(async () => {
    await Promise.all([
      deleteTestCategoriesByPrefix(TEST_CATEGORY_PREFIX),
      deleteTestTagsByPrefix(TEST_TAG_PREFIX),
      deleteTestAuthorsByPrefix(TEST_AUTHOR_PREFIX),
      deleteMediaByAltText(TEST_MEDIA_ALT_TEXT),
    ])
  })

  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/login')
    await page.getByLabel('Email').fill(ADMIN_EMAIL)
    await page.getByLabel('Password').fill(ADMIN_PASSWORD)
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page).toHaveURL(/\/admin$/)
  })

  test('can create a category and see it listed', async ({ page }) => {
    const name = `${TEST_CATEGORY_PREFIX}${Date.now()}`
    await page.goto('/admin/categories')
    await page.getByLabel('Name').fill(name)
    await page.getByRole('button', { name: 'Add category' }).click()
    await expect(page.getByText(name)).toBeVisible()
  })

  test('can create a tag and see it listed', async ({ page }) => {
    const name = `${TEST_TAG_PREFIX}${Date.now()}`
    await page.goto('/admin/tags')
    await page.getByLabel('Tag name').fill(name)
    await page.getByRole('button', { name: 'Add tag' }).click()
    await expect(page.getByText(name)).toBeVisible()
  })

  test('can upload an image to the media library', async ({ page }) => {
    await page.goto('/admin/media')
    const fileInput = page.locator('input[name="file"]')
    await fileInput.setInputFiles(path.join(__dirname, 'fixtures', 'test-image.png'))
    await page.getByLabel('Alt text').fill(TEST_MEDIA_ALT_TEXT)
    await page.getByRole('button', { name: 'Upload' }).click()
    await expect(page.getByRole('button', { name: 'Edit' }).first()).toBeVisible({
      timeout: 15_000,
    })
  })

  test('can create an author', async ({ page }) => {
    const name = `${TEST_AUTHOR_PREFIX}${Date.now()}`
    await page.goto('/admin/authors')
    await page.locator('#name-new').fill(name)
    await page.getByRole('button', { name: 'Add author' }).click()
    await expect(page.getByText(name)).toBeVisible({ timeout: 10_000 })
  })
})
