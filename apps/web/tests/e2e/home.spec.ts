import { expect, test } from "@playwright/test";

test("renders the PickIt home page", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "PICKIT" })).toBeVisible();
  await expect(page.getByText("모두의 소비 고민이 모여")).toBeVisible();
  await expect(page.getByText("오늘의 소비 고민")).toHaveCount(0);

  await expect(page.getByRole("button", { name: "구글 로그인" })).toBeVisible();
  await expect(page.getByRole("button", { name: "카카오 로그인" })).toBeVisible();

  await page.getByRole("button", { name: "구글 로그인" }).click();
  await expect(
    page.getByRole("heading", { name: "나에게 맞는 태그를 선택해주세요" }),
  ).toBeVisible();
});
