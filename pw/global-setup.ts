import { expect, test as setup } from "@playwright/test";

setup("Playwright is working", async ({ page }) => {
  const response = await page.goto("/");

  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle(/\w+/);
});
