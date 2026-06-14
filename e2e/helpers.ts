import { expect, type Page } from "@playwright/test";

export function todayIso(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

export async function gotoFreshApp(page: Page): Promise<void> {
  await page.goto("/");
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();
  await expect(page.getByRole("button", { name: "Início" })).toBeVisible({
    timeout: 30_000,
  });
}

export async function goToTab(page: Page, label: string): Promise<void> {
  await page.getByRole("button", { name: label }).click();
}

export async function restoreDefaultProfile(page: Page): Promise<void> {
  await goToTab(page, "Config.");
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Restaurar dados de exemplo" }).click();
}

export async function saveAccountBalance(
  page: Page,
  amount: number,
  date = todayIso()
): Promise<void> {
  await goToTab(page, "Config.");
  await page.getByTestId("account-balance-amount").fill(String(amount));
  await page.getByTestId("account-balance-date").fill(date);
  await page.getByTestId("save-account-balance").click();
  await expect(page.getByText("Saldo salvo")).toBeVisible();
}

export async function registerPayment(
  page: Page,
  optionLabel: string
): Promise<void> {
  await goToTab(page, "Início");
  await page.getByRole("button", { name: "+ Pagamento" }).click();
  await expect(
    page.getByRole("heading", { name: "Registrar pagamento" })
  ).toBeVisible();
  await page.locator("select").selectOption({ label: optionLabel });
  await page.getByRole("button", { name: "Salvar" }).click();
  await expect(
    page.getByRole("heading", { name: "Registrar pagamento" })
  ).toBeHidden();
}
