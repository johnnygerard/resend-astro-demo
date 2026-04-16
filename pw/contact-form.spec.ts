import { faker } from "@faker-js/faker";
import { expect, test } from "@playwright/test";

test("contact form submission shows success message", async ({ page }) => {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const email = faker.internet.email({ firstName, lastName });
  const message = faker.lorem.paragraph();

  // Visit the homepage and fill out the contact form
  await page.goto("/");
  await page.getByLabel("Name").fill(`${firstName} ${lastName}`);
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Message").fill(message);

  // Wait for the Turnstile verification token to be generated
  const turnstileHiddenInput = page.locator('[name="cf-turnstile-response"]');
  await expect(turnstileHiddenInput).toHaveValue(/.+/);

  // Submit the form
  await page.getByRole("button").click();

  // Expect a success message
  await expect(page.getByText("thank")).toBeVisible();
});
