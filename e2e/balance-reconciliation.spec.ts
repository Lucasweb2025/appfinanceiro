import { test, expect } from "@playwright/test";
import {
  gotoFreshApp,
  goToTab,
  restoreDefaultProfile,
  saveAccountBalance,
} from "./helpers";

test.describe("saldo conferido", () => {
  test("atualizar saldo em Config reflete no Início", async ({ page }) => {
    await gotoFreshApp(page);
    await restoreDefaultProfile(page);
    await saveAccountBalance(page, 2);

    await goToTab(page, "Início");

    await expect(page.getByTestId("current-account-balance")).toHaveText(
      "R$ 2,00"
    );
    await expect(page.getByTestId("available-to-spend")).toHaveText("R$ 2,00");
  });
});
