import { expect, test } from "@playwright/test";

test("renders the PickIt home page", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "PICKIT" })).toBeAttached();
  await expect(page.getByRole("link", { name: "전체" })).toBeVisible();
  await expect(page.getByLabel("주요")).toBeVisible();
  await expect(page.getByText("모두의 소비 고민이 모여")).toHaveCount(0);
});

test("filter chips update the URL with a stage query param", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("link", { name: "대학생" }).click();
  await expect(page).toHaveURL(/[?&]stage=university\b/);
  await expect(page.getByRole("link", { name: "대학생" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );

  await page.getByRole("link", { name: "전체" }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("link", { name: "전체" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
});
