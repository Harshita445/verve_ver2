import { test, expect } from "@playwright/test";

test.describe("Authentication flow", () => {
  test("signup page loads", async ({ page }) => {
    await page.goto("/signup");
    await expect(page.getByText("Create your account")).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
  });

  test("login page loads", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByText("Welcome back")).toBeVisible();
  });

  test("forgot password link navigates", async ({ page }) => {
    await page.goto("/login");
    await page.getByText("Forgot?").click();
    await expect(page).toHaveURL(/\/forgot-password/);
  });

  test("forgot password page works", async ({ page }) => {
    await page.goto("/forgot-password");
    await expect(page.getByText("Reset your password")).toBeVisible();
    await page.fill('input[type="email"]', "test@example.com");
    await page.getByRole("button", { name: /send/i }).click();
    await expect(page.getByText(/reset link has been sent/i)).toBeVisible();
  });
});

test.describe("Protected pages redirect", () => {
  test("dashboard redirects to login", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });

  test("training requires auth", async ({ page }) => {
    await page.goto("/training");
    await expect(page).toHaveURL(/\/login/);
  });
});
