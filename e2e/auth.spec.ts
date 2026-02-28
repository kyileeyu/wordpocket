import { test, expect } from "@playwright/test"

test.describe("Authentication", () => {
  test("unauthenticated user is redirected to /welcome", async ({ browser }) => {
    // Create a fresh context with no stored auth
    const context = await browser.newContext({ storageState: undefined })
    const page = await context.newPage()

    await page.goto("/")
    await expect(page).toHaveURL(/\/welcome/)

    await context.close()
  })

  test("authenticated user sees home page", async ({ page }) => {
    await page.goto("/")
    await expect(page).toHaveURL("/")
    await expect(page.getByText("오늘의 복습")).toBeVisible()
  })

  test("invalid credentials show error", async ({ browser }) => {
    const context = await browser.newContext({ storageState: undefined })
    const page = await context.newPage()

    await page.goto("/login")
    await page.getByLabel("이메일").fill("wrong@example.com")
    await page.getByLabel("비밀번호").fill("wrongpassword")
    await page.getByRole("button", { name: "로그인" }).click()

    // Should show error message and stay on login page
    await expect(page.locator(".text-brick")).toBeVisible({ timeout: 5000 })
    await expect(page).toHaveURL(/\/login/)

    await context.close()
  })
})
