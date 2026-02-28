import { test, expect } from "@playwright/test"

test.describe("Study Session", () => {
  test("start study and interact with card", async ({ page }) => {
    await page.goto("/")

    // Click study CTA if available
    const studyCta = page.getByRole("link", { name: /학습 시작/ })
    if (await studyCta.isVisible({ timeout: 3000 }).catch(() => false)) {
      await studyCta.click()
      await expect(page).toHaveURL(/\/study\//)

      // Wait for the card to load
      const card = page.locator("[data-testid='word-card']").or(
        page.locator("text=카드가 없습니다").or(
          page.getByText(/\d+ \/ \d+/),
        ),
      )
      await expect(card.first()).toBeVisible({ timeout: 10000 })

      // If we have cards, flip and respond
      const counter = page.getByText(/\d+ \/ \d+/)
      if (await counter.isVisible().catch(() => false)) {
        // Tap the card to flip
        await page.locator(".flex-1.flex.items-center").click()

        // Wait for response buttons to appear
        const responseBtn = page.getByRole("button", { name: /Good|Again|Easy|Hard/ }).first()
        if (await responseBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
          await responseBtn.click()
        }
      }
    } else {
      // No cards due — verify empty state or home page is shown
      await expect(page.getByText("오늘의 복습")).toBeVisible()
    }
  })

  test("study page shows empty state when no cards", async ({ page }) => {
    // Navigate to a non-existent deck study page
    await page.goto("/study/00000000-0000-0000-0000-000000000000")

    // Should show empty state or redirect
    const emptyOrError = page
      .getByText("오늘 학습할 카드가 없습니다.")
      .or(page.getByText("오늘의 복습"))
    await expect(emptyOrError.first()).toBeVisible({ timeout: 10000 })
  })
})
