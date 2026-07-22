import { test, expect } from "@playwright/test";

test.describe("Goals page", () => {
  test("goals page redirects when unauthenticated", async ({ page }) => {
    await page.goto("/goals");
    await expect(page).toHaveURL(/\/login/);
  });
});
