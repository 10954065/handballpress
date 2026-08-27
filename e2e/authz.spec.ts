import { test, expect, type Page } from '@playwright/test'
import { createTestUser, deleteTestUserByEmail, deleteTestArticlesByPrefix } from './test-db'

// Exercises the two authorization boundaries enforced in
// src/lib/articles/actions.ts (canModifyArticle + the EDITOR-only publish
// gate) end-to-end through real logins, rather than unit-testing the
// predicate in isolation — a role check that's correct in isolation but
// never wired into the action, or wired into the wrong branch, would still
// pass a unit test.
const RUN_ID = Date.now()
const AUTHOR_A_EMAIL = `e2e-authz-a-${RUN_ID}@handballpressgh.com`
const AUTHOR_B_EMAIL = `e2e-authz-b-${RUN_ID}@handballpressgh.com`
const TEST_PASSWORD = 'e2e-Test-Password-123!'
const ARTICLE_PREFIX = 'E2E Authz Article '

async function login(page: Page, email: string, password: string) {
  await page.goto('/admin/login')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password').fill(password)
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page).toHaveURL(/\/admin$/)
}

test.describe('article authorization boundaries', () => {
  // Serial, not parallel: locally (workers: undefined outside CI) these two
  // tests would otherwise hit Turbopack's dev server at the same moment,
  // each triggering a first-ever compile of a heavy route (the tag-checkbox
  // article form) — that compile-queue contention, not the app or the test
  // logic, was the sole cause of a 90s timeout observed here. CI already
  // runs with workers: 1 so this only changes local iteration.
  test.describe.configure({ mode: 'serial' })

  test.beforeAll(async () => {
    await createTestUser({
      email: AUTHOR_A_EMAIL,
      name: 'E2E Author A',
      password: TEST_PASSWORD,
      role: 'AUTHOR',
    })
    await createTestUser({
      email: AUTHOR_B_EMAIL,
      name: 'E2E Author B',
      password: TEST_PASSWORD,
      role: 'AUTHOR',
    })
  })

  test.afterAll(async () => {
    await deleteTestArticlesByPrefix(ARTICLE_PREFIX)
    await Promise.all([
      deleteTestUserByEmail(AUTHOR_A_EMAIL),
      deleteTestUserByEmail(AUTHOR_B_EMAIL),
    ])
  })

  test("an AUTHOR cannot edit another AUTHOR's draft", async ({ page }) => {
    // Generous timeout: two real logins (each a real Argon2 verify) plus
    // creating an article and loading the edit page — which, like the new
    // article page, renders a checkbox per real tag (175+ post-migration) —
    // adds up to meaningfully more work than article-editor.spec's
    // single-login 60s budget.
    test.setTimeout(90_000)
    const title = `${ARTICLE_PREFIX}${RUN_ID}`

    await login(page, AUTHOR_A_EMAIL, TEST_PASSWORD)
    await page.goto('/admin/articles/new')
    await page.getByLabel('Title', { exact: true }).fill(title)
    await page.locator('.article-editor-content').click()
    await page.keyboard.type('Original body text.')
    await page.getByRole('button', { name: 'Create article' }).click()
    await expect(page).toHaveURL(/\/admin\/articles$/, { timeout: 15_000 })

    const row = page.locator('tr', { hasText: title })
    await expect(row).toBeVisible()
    const editHref = await row.getByRole('link', { name: 'Edit' }).getAttribute('href')

    // On narrow viewports the sidebar (and its Sign out button) lives behind
    // a hamburger drawer — open it first. On wide viewports this toggle is
    // `lg:hidden` and never renders, so Sign out is already reachable.
    const mobileNavToggle = page.getByRole('button', { name: 'Toggle admin navigation' })
    if (await mobileNavToggle.isVisible()) {
      await mobileNavToggle.click()
    }
    await page.getByRole('button', { name: 'Sign out' }).click()
    await login(page, AUTHOR_B_EMAIL, TEST_PASSWORD)

    // The edit page itself loads (any AUTHOR+ can view the form) — only the
    // submit is expected to be rejected.
    await page.goto(editHref!)
    await page.getByLabel('Title', { exact: true }).fill(`${title} (tampered)`)
    await page.getByRole('button', { name: 'Save changes' }).click()

    await expect(page.getByText('You do not have permission to edit this article.')).toBeVisible()

    await page.goto('/admin/articles')
    await expect(page.getByText(title, { exact: true })).toBeVisible()
    await expect(page.getByText(`${title} (tampered)`)).toHaveCount(0)
  })

  test('an AUTHOR cannot force-publish by bypassing the disabled UI control', async ({ page }) => {
    test.setTimeout(60_000)
    const title = `${ARTICLE_PREFIX}${RUN_ID} Bypass`

    await login(page, AUTHOR_A_EMAIL, TEST_PASSWORD)
    await page.goto('/admin/articles/new')
    await page.getByLabel('Title', { exact: true }).fill(title)
    await page.locator('.article-editor-content').click()
    await page.keyboard.type('Body text.')

    // "Publish now" is `disabled` for AUTHOR role client-side (defense in
    // depth) — force it enabled+checked to simulate a bypassed client
    // (devtools, a hand-crafted POST) and confirm the server itself still
    // rejects the unauthorized publish, not just the UI.
    await page.evaluate(() => {
      const radio = document.querySelector<HTMLInputElement>(
        'input[name="publishMode"][value="now"]'
      )
      if (!radio) throw new Error('publishMode radio not found')
      radio.disabled = false
      radio.click()
    })
    await page.getByRole('button', { name: 'Create article' }).click()

    // requireRole() redirects unauthorized attempts to /admin instead of
    // returning an inline error — the outcome that matters is that no
    // article got created (db.article.create sits after the role check).
    await page.waitForURL(/\/admin$/, { timeout: 15_000 })
    await page.goto('/admin/articles')
    await expect(page.getByText(title)).toHaveCount(0)
  })
})
