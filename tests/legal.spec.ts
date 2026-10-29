import { expect, test } from "@playwright/test";

test.describe("before any cookie choice", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("cookie consent offers accept, reject and per-category preferences that persist", async ({
    page,
  }) => {
    await page.goto("/");
    const banner = page.getByRole("region", {
      name: "Preferências de cookies",
    });
    await expect(banner).toBeVisible();
    await expect(
      banner.getByRole("link", { name: "Política de Cookies" }),
    ).toHaveAttribute("href", "/cookies");
    await expect(
      banner.getByRole("button", { name: "Aceitar todos" }),
    ).toBeVisible();
    await expect(
      banner.getByRole("button", { name: "Rejeitar" }),
    ).toBeVisible();
    await banner
      .getByRole("button", { name: "Gerenciar preferências" })
      .click();
    await expect(
      banner.getByRole("switch", { name: /Essenciais/ }),
    ).toBeDisabled();
    await banner.getByRole("switch", { name: /Analíticos/ }).check();
    await banner.getByRole("button", { name: "Salvar preferências" }).click();
    await expect(banner).toHaveCount(0);
    const stored = await page.evaluate(() =>
      JSON.parse(localStorage.getItem("matriculou-consent")!),
    );
    expect(stored).toMatchObject({ analytics: true, marketing: false });
    await expect(page.locator("html")).toHaveAttribute(
      "data-consent-analytics",
      "true",
    );
    await page.reload();
    await expect(
      page.getByRole("region", { name: "Preferências de cookies" }),
    ).toHaveCount(0);
    await page.getByRole("button", { name: "Preferências de cookies" }).click();
    await page
      .getByRole("region", { name: "Preferências de cookies" })
      .getByRole("button", { name: "Rejeitar" })
      .click();
    expect(
      await page.evaluate(
        () => JSON.parse(localStorage.getItem("matriculou-consent")!).analytics,
      ),
    ).toBe(false);
  });
});

test("signup requires the terms and refuses markup", async ({ page }) => {
  await page.goto("/cadastro");
  await expect(
    page.getByRole("link", { name: "Termos de Serviço" }),
  ).toHaveAttribute("href", "/termos-de-servico");
  const terms = page.getByRole("checkbox", { name: /Li e aceito/ });
  await expect(terms).toHaveAttribute("required", "");
  await expect(page.getByRole("checkbox", { name: /18 anos/ })).toHaveAttribute(
    "required",
    "",
  );
  const name = page.getByLabel("Nome completo");
  await name.fill("<script>alert(1)</script>");
  expect(
    await name.evaluate((el: HTMLInputElement) => el.validity.customError),
  ).toBe(true);
  await name.fill("Ana Maria D'Ávila");
  expect(await name.evaluate((el: HTMLInputElement) => el.validity.valid)).toBe(
    true,
  );
});

test("every legal document is reachable from the footer", async ({ page }) => {
  const pages = [
    ["Política de Privacidade", "/privacidade"],
    ["Termos de Uso", "/termos-de-uso"],
    ["Termos de Serviço", "/termos-de-servico"],
    ["Política de Cookies", "/cookies"],
    ["Seus direitos (LGPD)", "/lgpd"],
  ];
  for (const [label, href] of pages) {
    await page.goto("/sobre");
    const link = page
      .locator("footer")
      .getByRole("link", { name: label, exact: true });
    await expect(link).toHaveAttribute("href", href);
    await page.goto(href);
    await expect(page.locator(".legalHero h1")).toBeVisible();
    await expect(page.locator(".legalNav a[aria-current=page]")).toHaveText(
      label,
    );
  }
  await expect(page).toHaveTitle(/Seus direitos \(LGPD\) · Matriculou/);
});

test("sign up cannot be submitted without accepting the terms and the age statement", async ({
  page,
}) => {
  await page.goto("/cadastro");
  await page.getByLabel("Nome completo").fill("Pessoa Teste");
  await page.getByLabel("E-mail").fill("pessoa@example.com");
  await page.getByLabel("Senha", { exact: true }).fill("Senha-segura-1");
  await page.getByLabel("Confirme a senha").fill("Senha-segura-1");
  const form = page.locator("form.authForm");
  expect(await form.evaluate((f: HTMLFormElement) => f.checkValidity())).toBe(
    false,
  );
  await page.getByLabel(/Li e aceito os Termos de Uso/).check();
  await page.getByLabel(/Tenho 18 anos ou mais/).check();
  expect(await form.evaluate((f: HTMLFormElement) => f.checkValidity())).toBe(
    true,
  );
  await expect(
    page.getByRole("link", { name: "Política de Privacidade" }).first(),
  ).toHaveAttribute("href", "/privacidade");
});

test("catalog shows no fabricated ratings and every image has a text alternative", async ({
  page,
}) => {
  await page.goto("/instituicoes");
  const cards = page.locator(".instCard");
  await expect(cards.first()).toBeVisible();
  await expect(page.locator(".cardGrid")).not.toContainText("★");
  await expect(page.locator("img:not([alt]), img[alt='']")).toHaveCount(0);
  await cards
    .first()
    .getByRole("button", { name: /Ver detalhes/ })
    .click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toContainText("e-MEC");
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
});
