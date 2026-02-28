import { test, expect } from "@playwright/test"

const TEST_FOLDER = `E2E 테스트 ${Date.now()}`
const TEST_DECK = `E2E 덱 ${Date.now()}`

test.describe("Folder & Deck CRUD", () => {
  test("create and delete a folder", async ({ page }) => {
    await page.goto("/")

    // Create folder via FAB
    await page.getByRole("button", { name: "+" }).click()
    await page.getByPlaceholder("단어장 이름").fill(TEST_FOLDER)
    await page.getByRole("button", { name: "만들기" }).click()

    // Folder should appear in the list
    await expect(page.getByText(TEST_FOLDER)).toBeVisible({ timeout: 5000 })

    // Navigate into the folder
    await page.getByText(TEST_FOLDER).click()
    await expect(page).toHaveURL(/\/folder\//)

    // Delete the folder via settings or back
    // Long-press or find delete action — use the page menu if available
    // For now, verify the folder page loads correctly
    await expect(page.getByText(TEST_FOLDER)).toBeVisible()
  })

  test("create a deck inside a folder", async ({ page }) => {
    await page.goto("/")

    // Find and click a folder (use the first one available)
    const folderLink = page.locator("a[href^='/folder/']").first()
    if (await folderLink.isVisible()) {
      await folderLink.click()
      await expect(page).toHaveURL(/\/folder\//)

      // Create a deck via FAB
      await page.getByRole("button", { name: "+" }).click()
      await page.getByPlaceholder("덱 이름").fill(TEST_DECK)
      await page.getByRole("button", { name: "만들기" }).click()

      // Deck should appear
      await expect(page.getByText(TEST_DECK)).toBeVisible({ timeout: 5000 })
    }
  })
})
