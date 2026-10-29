import fs from "node:fs";
import { expect, test, type Page } from "@playwright/test";

// The account area needs a signed-in user: auth and profile endpoints are mocked in the
// test browser only, while the public catalog is still read with the publishable key.
const env = fs.existsSync(".env.local")
  ? fs.readFileSync(".env.local", "utf8")
  : "";
const anon = env.match(/PUBLISHABLE_KEY=(.*)/)?.[1]?.trim();
test.skip(!anon, "Supabase is not configured in .env.local");

const id = "00000000-0000-4000-8000-000000000001";
const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString("base64url");
const token = `${b64({ alg: "HS256", typ: "JWT" })}.${b64({ sub: id, role: "authenticated", exp: Math.floor(Date.now() / 1000) + 3600 })}.sig`;
const user = {
  id,
  aud: "authenticated",
  role: "authenticated",
  email: "pessoa@example.com",
  user_metadata: {},
  app_metadata: {},
  created_at: "2026-10-01T00:00:00Z",
};

async function signIn(page: Page, next = "/perfil") {
  for (const table of ["instituicoes", "ofertas"])
    await page.route(`**/rest/v1/${table}**`, (r) =>
      r.continue({
        headers: { ...r.request().headers(), authorization: `Bearer ${anon}` },
      }),
    );
  await page.route("**/auth/v1/token**", (r) =>
    r.fulfill({
      json: {
        access_token: token,
        token_type: "bearer",
        expires_in: 3600,
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        refresh_token: "r",
        user,
      },
    }),
  );
  await page.route("**/auth/v1/user**", (r) => r.fulfill({ json: user }));
  await page.route("**/rest/v1/usuarios**", (r) =>
    r.fulfill({
      json: [
        {
          id,
          email: user.email,
          nome_completo: "Pessoa Teste",
          avatar_url: null,
          papel: "estudante",
          areas_interesse: ["Tecnologia"],
        },
      ],
    }),
  );
  for (const table of ["favoritos", "gestores", "mensagens"])
    await page.route(`**/rest/v1/${table}**`, (r) => r.fulfill({ json: [] }));
  await page.route("**/rest/v1/candidaturas**", (r) =>
    r.fulfill({
      json: [
        {
          id: "c1",
          user_id: id,
          instituicao_id: "mg-01",
          oferta_id: null,
          curso_nome: "Ciência da Computação",
          nome: "Pessoa Teste",
          email: user.email,
          telefone: null,
          mensagem: null,
          status: "em_analise",
          created_at: "2026-10-20T12:00:00Z",
          atualizado_em: "2026-10-21T12:00:00Z",
        },
      ],
    }),
  );
  await page.route("**/rest/v1/documentos_usuario**", (r) =>
    r.fulfill({
      json: [
        {
          id: "d1",
          nome: "Documento de identidade",
          path: `${id}/documentos/rg.jpg`,
          created_at: "2026-10-20T12:00:00Z",
        },
      ],
    }),
  );
  await page.route("**/storage/v1/object/sign/**", (r) =>
    r.fulfill({
      json: [
        {
          path: `${id}/documentos/rg.jpg`,
          signedURL: "/object/sign/x?token=y",
          error: null,
        },
      ],
    }),
  );
  await page.goto(`/login?next=${encodeURIComponent(next)}`);
  await page.getByLabel("E-mail").fill(user.email);
  await page.getByLabel("Senha", { exact: true }).fill("senha-qualquer");
  await page.getByRole("button", { name: /Entrar na minha conta/ }).click();
  await page.waitForURL(`**${next}`);
}

test("login returns to the requested page and the session persists", async ({
  page,
}) => {
  await signIn(page, "/comparar");
  await expect(page.locator(".userTrigger")).toBeVisible();
  await page.reload();
  await expect(page.locator(".userTrigger")).toBeVisible();
});

test("profile shows the overview with a side menu of account options", async ({
  page,
}) => {
  await signIn(page);
  await expect(
    page.getByRole("heading", { name: "Olá, Pessoa.", level: 1 }),
  ).toBeVisible();
  const background = await page
    .locator("body")
    .evaluate((el) => getComputedStyle(el).backgroundColor);
  expect(background).toBe("rgb(23, 34, 41)");
  await expect(page.locator(".accountMain")).toContainText(
    "Complete seu perfil",
  );
  await expect(page.locator(".accountMain")).toContainText("Em análise");

  const menu = page.getByRole("navigation", { name: "Minha jornada" });
  await menu.getByRole("button", { name: /Documentos/ }).click();
  await expect(page).toHaveURL(/secao=documentos/);
  await expect(
    page.getByRole("link", { name: "Documento de identidade" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Apagar Documento de identidade" }),
  ).toBeVisible();

  await menu.getByRole("button", { name: /Favoritas/ }).click();
  await expect(page.getByText("Nenhuma favorita ainda")).toBeVisible();

  await menu.getByRole("button", { name: /Candidaturas/ }).click();
  await expect(page.locator(".stepper")).toBeVisible();

  const account = page.getByRole("navigation", { name: "Conta" });
  await account.getByRole("button", { name: /Editar perfil/ }).click();
  await expect(page.getByLabel("Nome completo")).toHaveValue("Pessoa Teste");
  await account.getByRole("button", { name: /Segurança/ }).click();
  await expect(page.getByLabel("Senha atual")).toBeVisible();
  await account.getByRole("button", { name: /Privacidade/ }).click();
  await expect(
    page.getByRole("button", { name: /Baixar meus dados/ }).locator("svg"),
  ).toHaveCount(1);
  await page.getByRole("button", { name: /Excluir conta/ }).click();
  await expect(
    page.getByRole("button", { name: "Excluir definitivamente" }),
  ).toBeDisabled();
});

test("profile and admin fit a phone screen", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await signIn(page);
  await expect(page.locator(".accountSide")).toBeVisible();
  for (const route of ["/perfil?secao=editar", "/admin"]) {
    await page.goto(route);
    await expect(page.locator("h1").first()).toBeVisible();
    const [scroll, width] = await page.evaluate(() => [
      document.documentElement.scrollWidth,
      innerWidth,
    ]);
    expect(scroll, route).toBeLessThanOrEqual(width);
  }
});

test("institution panel opens every section for a team member", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.route("**/rest/v1/rpc/metricas_instituicao**", (r) =>
    r.fulfill({
      json: {
        favoritos: 12,
        cursos_ativos: 30,
        mensagens_nao_lidas: 1,
        candidaturas: { enviada: 2, em_analise: 1, matriculada: 1 },
      },
    }),
  );
  await page.route("**/rest/v1/rpc/equipe_instituicao**", (r) =>
    r.fulfill({
      json: [
        {
          user_id: id,
          nome: "Pessoa Teste",
          email: user.email,
          papel: "admin",
          created_at: "2026-10-01T00:00:00Z",
        },
      ],
    }),
  );
  for (const table of ["comunicados", "auditoria"])
    await page.route(`**/rest/v1/${table}**`, (r) => r.fulfill({ json: [] }));
  await signIn(page, "/admin");
  await page.unroute("**/rest/v1/gestores**");
  await page.route("**/rest/v1/gestores**", (r) =>
    r.fulfill({ json: [{ instituicao_id: "mg-01", papel: "admin" }] }),
  );
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Visão geral" }),
  ).toBeVisible();
  await expect(page.locator(".kpi").first()).toContainText("2");
  for (const [label, heading] of [
    ["Candidaturas", "Candidaturas"],
    ["Alunos e contatos", "Alunos e contatos"],
    ["Cursos", "Cursos"],
    ["Dados da instituição", "Dados da instituição"],
    ["Comunicados", "Comunicados"],
    ["Atividade", "Atividade"],
    ["Equipe", "Equipe"],
  ]) {
    await page
      .getByRole("navigation", { name: /Instituição|Gestão/ })
      .getByRole("button", { name: label, exact: true })
      .click();
    await expect(
      page.getByRole("heading", { name: heading, level: 1 }),
    ).toBeVisible();
  }
  await expect(page.locator(".memberList")).toContainText("Pessoa Teste");
  expect(errors).toEqual([]);
});
