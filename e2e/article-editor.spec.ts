import path from 'node:path'
import { test, expect } from '@playwright/test'
import {
  deleteTestArticlesByPrefix,
  deleteTestAuthorsByPrefix,
  deleteTestCategoriesByPrefix,
  deleteTestTagsByPrefix,
} from './test-db'

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? ''
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? ''

// Distinct prefixes from cms-taxonomy.spec.ts (not just distinct names) —
// two spec files' test.afterAll cleanups run independently, and a shared
// prefix lets one file's bulk-delete-by-prefix wipe the other file's
// still-in-flight test data if both run concurrently (this bit us once).
const RUN_ID = Date.now()
const CATEGORY_PREFIX = 'E2E ArtCategory '
const TAG_PREFIX = 'e2e-art-tag-'
const AUTHOR_PREFIX = 'E2E ArtAuthor '
const CATEGORY_NAME = `${CATEGORY_PREFIX}${RUN_ID}`
const TAG_NAME = `${TAG_PREFIX}${RUN_ID}`
const AUTHOR_NAME = `${AUTHOR_PREFIX}${RUN_ID}`
const ARTICLE_TITLE = `E2E Article ${RUN_ID}`
const IMAGE_CAPTION = `e2e-test-caption-${RUN_ID}`

test.describe('article editor', () => {
  test.skip(!ADMIN_EMAIL || !ADMIN_PASSWORD, 'SEED_ADMIN_EMAIL/PASSWORD not set for this run')

  test.afterAll(async () => {
    // Note: this doesn't clean up the Media/Blob row created by the inline
    // toolbar upload — the editor only lets you set the image's caption at
    // insert time, not the underlying Media.altText, so there's no marker
    // to match on for that row. One small leftover test image per run is an
    // accepted trade-off here.
    await deleteTestArticlesByPrefix('E2E Article ')
    await Promise.all([
      deleteTestCategoriesByPrefix(CATEGORY_PREFIX),
      deleteTestTagsByPrefix(TAG_PREFIX),
      deleteTestAuthorsByPrefix(AUTHOR_PREFIX),
    ])
  })

  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/login')
    await page.getByLabel('Email').fill(ADMIN_EMAIL)
    await page.getByLabel('Password').fill(ADMIN_PASSWORD)
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page).toHaveURL(/\/admin$/)
  })

  test('can create a full article with an inline image and publish it', async ({ page }) => {
    // Seed a category/author/tag to select in the form.
    await page.goto('/admin/categories')
    await page.getByLabel('Name').fill(CATEGORY_NAME)
    await page.getByRole('button', { name: 'Add category' }).click()
    await expect(page.getByText(CATEGORY_NAME)).toBeVisible()

    await page.goto('/admin/tags')
    await page.getByLabel('Tag name').fill(TAG_NAME)
    await page.getByRole('button', { name: 'Add tag' }).click()
    await expect(page.getByText(TAG_NAME)).toBeVisible()

    await page.goto('/admin/authors')
    await page.locator('#name-new').fill(AUTHOR_NAME)
    await page.getByRole('button', { name: 'Add author' }).click()
    await expect(page.getByText(AUTHOR_NAME)).toBeVisible()

    // Create the article.
    await page.goto('/admin/articles/new')
    await page.getByLabel('Title', { exact: true }).fill(ARTICLE_TITLE)
    await page.getByLabel('Excerpt').fill('An E2E test excerpt.')

    const editor = page.locator('.article-editor-content')
    await editor.click()
    await page.keyboard.type('This is the first paragraph of the article body.')

    // Insert an inline image via the toolbar upload (hidden file input,
    // triggered by the "Insert image" button — set directly rather than via
    // a native file-chooser dialog).
    await page
      .getByRole('toolbar')
      .locator('input[type="file"]')
      .setInputFiles(path.join(__dirname, 'fixtures', 'test-image.png'))
    await expect(page.locator('.article-image-node img')).toBeVisible({ timeout: 15_000 })
    await page.locator('.article-image-node figcaption input').first().fill(IMAGE_CAPTION)

    await page.getByLabel('Category').selectOption({ label: CATEGORY_NAME })
    await page.getByLabel('Author').selectOption({ label: AUTHOR_NAME })
    await page.getByLabel(TAG_NAME).check()

    await page.getByLabel('Publish now').check()
    await page.getByRole('button', { name: 'Create article' }).click()

    await expect(page).toHaveURL(/\/admin\/articles$/)
    await expect(page.getByText(ARTICLE_TITLE)).toBeVisible()

    // Follow through to the public page and confirm the sanitized content
    // (including the inline image) actually rendered.
    const row = page.locator('tr', { hasText: ARTICLE_TITLE })
    await expect(row.getByText('PUBLISHED')).toBeVisible()
    const [publicPage] = await Promise.all([
      page.context().waitForEvent('page'),
      row.getByRole('link', { name: 'View' }).click(),
    ])
    await expect(publicPage.getByRole('heading', { name: ARTICLE_TITLE })).toBeVisible()
    await expect(publicPage.getByText('This is the first paragraph')).toBeVisible()
    await expect(publicPage.locator('.article-body img')).toBeVisible()
    await expect(publicPage.getByText(IMAGE_CAPTION)).toBeVisible()
  })
})
