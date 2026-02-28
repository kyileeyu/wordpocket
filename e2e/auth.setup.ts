import { test as setup, expect } from "@playwright/test"

const authFile = "e2e/.auth/user.json"

setup("authenticate", async ({ page }) => {
  const email = process.env.E2E_TEST_EMAIL
  const password = process.env.E2E_TEST_PASSWORD

  if (!email || !password) {
    throw new Error(
      "E2E_TEST_EMAIL and E2E_TEST_PASSWORD must be set in .env.test",
    )
  }

  await page.goto("/login")
  await page.getByLabel("이메일").fill(email)
  await page.getByLabel("비밀번호").fill(password)
  await page.getByRole("button", { name: "로그인" }).click()

  // Wait for redirect to home page
  await expect(page).toHaveURL("/", { timeout: 10000 })

  await page.context().storageState({ path: authFile })
})
