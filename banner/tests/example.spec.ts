import { test, expect } from '@playwright/test'

test('homepage shows sum result', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: /Welkom bij Vite \+ TypeScript/i })).toBeVisible()
  await expect(page.locator('text=2 + 3 = 5')).toBeVisible()
})
