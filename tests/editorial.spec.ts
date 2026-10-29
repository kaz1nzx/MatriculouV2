import { test, expect } from "@playwright/test";

test("Mia filters the catalog, follows up on a city, persists and resets the conversation", async ({
  page,
}) => {
  await page.goto("/instituicoes");
  await page
    .getByRole("button", { name: "Abrir assistente", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Instituições públicas", exact: true })
    .click();
  await page
    .getByRole("link", { name: "Explorar instituições públicas", exact: true })
    .click();
  await expect(page).toHaveURL(/rede=publica/);
  await expect(page.getByLabel("Rede", { exact: true })).toHaveValue("publica");
  await page
    .getByRole("button", { name: "Abrir assistente", exact: true })
    .click();
  await page
    .getByLabel("Sua mensagem", { exact: true })
    .fill("Quero estudar perto de mim");
  await page
    .getByRole("button", { name: "Enviar mensagem", exact: true })
    .click();
  await expect(
    page.getByLabel("Sua mensagem", { exact: true }),
  ).toHaveAttribute("placeholder", "Em qual cidade você quer estudar?");
  await page.getByLabel("Sua mensagem", { exact: true }).fill("São Paulo");
  await page
    .getByRole("button", { name: "Enviar mensagem", exact: true })
    .click();
  await page
    .getByRole("link", { name: "Buscar em São Paulo", exact: true })
    .click();
  await expect(
    page.getByPlaceholder("Instituição, cidade, estado ou curso"),
  ).toHaveValue("São Paulo");
  await expect(page.getByLabel("Rede", { exact: true })).toHaveValue("");
  await page.reload();
  await page
    .getByRole("button", { name: "Abrir assistente", exact: true })
    .click();
  await expect(page.locator(".miaMessages")).toContainText("São Paulo");
  const download = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Baixar conversa", exact: true })
    .click();
  expect((await download).suggestedFilename()).toBe(
    "minha-conversa-matriculou.txt",
  );
  await page
    .getByRole("button", { name: "Nova conversa", exact: true })
    .click();
  await expect(page.locator(".miaMessage")).toHaveCount(1);
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("dialog", { name: "Mia / Matriculou" }),
  ).not.toBeVisible();
  await expect(
    page.getByRole("button", { name: "Abrir assistente", exact: true }),
  ).toBeFocused();
});

test("the 3D atlas works with keyboard and opens its selected course area", async ({
  page,
}) => {
  await page.goto("/");
  const globe = page.getByRole("slider", {
    name: "Girar esfera de áreas de estudo",
  });
  await globe.focus();
  await page.keyboard.press("ArrowRight");
  await expect(globe).toHaveAttribute("aria-valuetext", "Saúde");
  await page.getByRole("link", { name: "Explorar saúde", exact: true }).click();
  await expect(page).toHaveURL(/area=Sa/);
  await expect(
    page.locator(".courseCard h3").getByText("Enfermagem", { exact: true }),
  ).toBeVisible();
  // Database courses can add more health programs (e.g. Odontologia); every card must be Saúde.
  expect(await page.locator(".courseCard").count()).toBeGreaterThanOrEqual(3);
  expect(
    new Set(await page.locator(".courseCardTop span").allTextContents()),
  ).toEqual(new Set(["Saúde"]));
});

test("custom 404 preserves HTTP status and provides working recovery search on mobile", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 780 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  const response = await page.goto("/um-caminho-que-nao-existe");
  expect(response?.status()).toBe(404);
  await expect(
    page.getByRole("heading", { name: "Esse caminho ainda não existe." }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.getByLabel("Buscar uma instituição ou cidade").fill("Curitiba");
  await page
    .locator(".missingSearch")
    .getByRole("button", { name: "Buscar instituições", exact: true })
    .click();
  await expect(page).toHaveURL(/instituicoes\?q=Curitiba/);
  await expect(
    page.getByPlaceholder("Instituição, cidade, estado ou curso"),
  ).toHaveValue("Curitiba");
});
