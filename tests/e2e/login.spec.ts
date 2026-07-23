import { test, expect } from "@playwright/test";

test.describe("Login page", () => {
  test("renders the sign-in form", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
    await expect(page.getByPlaceholder("recruiter@company.com")).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign In" })).toBeVisible();
  });

  test("shows validation errors on invalid input", async ({ page }) => {
    await page.goto("/login");
    await page.getByPlaceholder("recruiter@company.com").fill("not-an-email");
    await page.getByPlaceholder("••••••••").fill("123"); // under the 6-char min
    await page.getByRole("button", { name: "Sign In" }).click();

    await expect(page.getByText("Invalid email address")).toBeVisible();
    await expect(page.getByText("Password must be at least 6 characters")).toBeVisible();
  });
});