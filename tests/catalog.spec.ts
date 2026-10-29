import { expect, test, type Page } from "@playwright/test";

const cards = (page: Page) => page.locator(".cardGrid > .instCard");

// Resultados de busca nunca podem ficar apagados por animações de rolagem.
async function fadedCards(page: Page) {
  await page.waitForTimeout(1200);
  return cards(page).evaluateAll(
    (list) =>
      list.filter((card) => {
        const r = card.getBoundingClientRect();
        const visible =
          (Math.min(r.bottom, innerHeight) - Math.max(r.top, 0)) / r.height;
        return (
          visible > 0.3 &&
          (Number(getComputedStyle(card).opacity) < 0.95 ||
            card.hasAttribute("data-reveal"))
        );
      }).length,
  );
}

test("filters stay in the URL and cards stay visible while scrolling", async ({
  page,
}) => {
  await page.goto("/instituicoes");
  await expect(cards(page).first()).toBeVisible();
  for (const uf of ["RS", "SP", ""]) {
    await page.getByLabel("Estado", { exact: true }).selectOption(uf);
    if (uf) await expect(page).toHaveURL(new RegExp(`uf=${uf}`));
    expect(await fadedCards(page)).toBe(0);
  }
  await page.getByLabel("Rede", { exact: true }).selectOption("privada");
  await expect(page).toHaveURL(/rede=privada/);
  for (let i = 0; i < 3; i++) {
    await page.mouse.wheel(0, 1100);
    expect(await fadedCards(page)).toBe(0);
  }
  await page.reload();
  await expect(page.getByLabel("Rede", { exact: true })).toHaveValue("privada");
  await page.getByRole("button", { name: "Remover filtro Privada" }).click();
  await expect(page).not.toHaveURL(/rede=/);
});

test("search matches courses, full state names and words in any order", async ({
  page,
}) => {
  await page.goto("/instituicoes");
  await expect(cards(page).first()).toBeVisible();
  const search = page.getByPlaceholder("Instituição, cidade, estado ou curso");
  const titles = () => cards(page).locator("h3").allInnerTexts();

  await search.fill("rio ufrj");
  await expect(page).toHaveURL(/q=rio/);
  expect(await titles()).toContain(
    "Universidade Federal do Rio de Janeiro (UFRJ)",
  );

  await search.fill("minas gerais");
  await expect(page).toHaveURL(/q=minas/);
  await expect(cards(page).first().locator(".instPlace")).toContainText("MG");

  await search.fill("medicina veterinaria");
  await expect(page).toHaveURL(/q=medicina/);
  expect((await titles()).length).toBeGreaterThan(0);
});

test("schools never show a MEC concept and sorting works", async ({ page }) => {
  await page.goto("/instituicoes?tipo=escola");
  await expect(cards(page).first()).toBeVisible();
  for (const fact of await cards(page)
    .locator(".instFacts div:nth-child(2) dd")
    .allTextContents())
    expect(fact).toBe("Não se aplica");
  await page.goto("/instituicoes?ordem=nome");
  const names = await cards(page).locator("h3").allInnerTexts();
  expect(names.slice(0, 5)).toEqual(
    [...names.slice(0, 5)].sort((a, b) => a.localeCompare(b)),
  );
});

test("an institution opens from the URL with courses and a share link", async ({
  page,
}) => {
  await page.goto("/instituicoes?abrir=mg-01");
  const dialog = page.getByRole("dialog");
  await expect(dialog).toContainText("Universidade Federal de Minas Gerais");
  await dialog.getByRole("button", { name: /Cursos/ }).click();
  await expect(dialog.locator(".offerGroup li").first()).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page).not.toHaveURL(/abrir=/);
});

test("course search finds courses by profession and shows where to study", async ({
  page,
}) => {
  await page.goto("/cursos");
  const search = page.getByLabel("Pesquisar curso, área ou profissão");
  await search.fill("advogado");
  await expect(page).toHaveURL(/q=advogado/);
  const card = page.locator(".courseCard").filter({
    has: page.getByRole("heading", { name: "Direito", exact: true }),
  });
  await expect(card).toBeVisible();
  await card.getByRole("button", { name: /Conhecer/ }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toContainText("3.700 horas");
  await expect(dialog).toContainText("OAB");
  await expect(dialog.locator(".placeList li").first()).toBeVisible();
  await page.keyboard.press("Escape");
  await search.fill("xyzabc");
  await expect(page.getByText("Nenhum curso encontrado")).toBeVisible();
});

test("smart comparison ranks institutions and highlights the best values", async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem(
      "matriculou-compare",
      JSON.stringify(["mg-01", "mg-02"]),
    ),
  );
  await page.goto("/comparar");
  await expect(page.locator(".verdict h2")).not.toBeEmpty();
  await expect(page.locator(".rankCard")).toHaveCount(2);
  const cost = page.locator(".compareTable tbody tr", { hasText: "Custo" });
  await expect(cost.locator("td.isBest")).toContainText("Gratuita");
  await page
    .getByRole("group", { name: "Custo" })
    .getByRole("button", { name: "Ignorar" })
    .click();
  await expect(page.locator(".rankCard").first()).toBeVisible();
});

test("every institution card shows a different picture", async ({ page }) => {
  await page.goto("/instituicoes");
  await expect(cards(page).first()).toBeVisible();
  const total = Number(
    (await page.locator(".resultHead b").first().innerText()).match(/\d+/)![0],
  );
  // Os cartões entram em lotes conforme a rolagem.
  for (let i = 0; i < 12 && (await cards(page).count()) < total; i++) {
    await cards(page).last().scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
  }
  await expect(cards(page)).toHaveCount(total);
  const sources = await cards(page)
    .locator(".instMedia img")
    .evaluateAll((imgs) =>
      imgs.map((img) =>
        decodeURIComponent(
          (img as HTMLImageElement).currentSrc || (img as HTMLImageElement).src,
        ).replace(/.*url=([^&]+).*/, "$1"),
      ),
    );
  expect(sources.length).toBe(total);
  expect(
    sources.filter((src, index) => sources.indexOf(src) !== index),
  ).toEqual([]);
});
