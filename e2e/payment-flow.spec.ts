import { test, expect } from "@playwright/test";
import {
  gotoFreshApp,
  goToTab,
  registerPayment,
  restoreDefaultProfile,
  saveAccountBalance,
} from "./helpers";

test.describe("pagamentos + saldo real", () => {
  test("marcar contas pagas e conferir saldo não fica negativo", async ({
    page,
  }) => {
    await gotoFreshApp(page);
    await restoreDefaultProfile(page);

    await registerPayment(page, "Claro Flex");
    await registerPayment(page, "Faculdade (até mar/28)");
    await saveAccountBalance(page, 2);

    await goToTab(page, "Início");

    await expect(page.getByTestId("current-account-balance")).toHaveText(
      "R$ 2,00"
    );
    await expect(page.getByTestId("available-to-spend")).toHaveText("R$ 2,00");
  });

  test('botão "Já paguei" abre registro de pagamento', async ({ page }) => {
    await gotoFreshApp(page);
    await restoreDefaultProfile(page);
    await goToTab(page, "Início");

    const payButton = page.getByRole("button", { name: "Já paguei" }).first();
    await expect(payButton).toBeVisible();
    await payButton.click();

    await expect(
      page.getByRole("heading", { name: "Registrar pagamento" })
    ).toBeVisible();
  });
});
