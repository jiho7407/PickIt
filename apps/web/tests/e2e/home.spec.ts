import { expect, test } from "@playwright/test";

test("renders the PickIt home page", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "PICKIT" })).toBeAttached();
  await expect(page.getByRole("button", { name: "전체" })).toBeVisible();
  await expect(page.getByLabel("주요")).toBeVisible();
  await expect(page.getByText("모두의 소비 고민이 모여")).toHaveCount(0);
});
