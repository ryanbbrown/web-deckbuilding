import { test, expect } from '@playwright/test';

test('should load homepage successfully', async ({ page }) => {
  // Navigate to the homepage
  await page.goto('/');

  // Check that the page has loaded without critical errors
  await expect(page.locator('body')).toBeVisible();

  // Check that we can see the basic page structure
  await expect(page.locator('html')).toBeVisible();
});

test('should have no console errors on homepage', async ({ page }) => {
  // Listen for console errors
  const messages: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      messages.push(msg.text());
    }
  });

  await page.goto('/');

  // Wait a bit for any async operations
  await page.waitForTimeout(1000);

  // Check that there are no critical console errors
  // Note: You might want to filter out expected errors here
  expect(
    messages.filter((msg) => !msg.includes('404') && !msg.includes('favicon'))
  ).toHaveLength(0);
});
