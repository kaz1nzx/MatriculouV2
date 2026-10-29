import { test, expect } from "@playwright/test";

test("new home story follows scrolling and the horizon opens into the final scene", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  const story = page.locator(".scrollStory-possibilities");
  // Motion loads on the first interaction, as it does for a real visitor.
  await page.mouse.wheel(0, 1);
  await expect(story).toHaveClass(/isMotion/, { timeout: 20000 });
  await page.locator("#story-possibilities-2").scrollIntoViewIfNeeded();
  await expect(
    story.locator(".scrollStoryChapter[aria-current=step] h3"),
  ).toHaveText("Uma escolha com a sua cara.");
  await expect(story.locator(".scrollStoryVisualWord")).toHaveText(
    "TRANSFORMAR",
  );
  const portal = page.locator(".cinemaPortal");
  await expect(portal).toHaveClass(/isMotion/);
  await page.evaluate(() => {
    const element = document.querySelector<HTMLElement>(".cinemaPortal")!;
    scrollTo({
      top:
        element.getBoundingClientRect().top +
        scrollY +
        (element.offsetHeight - innerHeight) * 0.96,
      behavior: "instant",
    });
  });
  await expect
    .poll(() =>
      page
        .locator(".cinemaPortalCopy")
        .evaluate((el) => Number(getComputedStyle(el).opacity)),
    )
    .toBeGreaterThan(0.95);
  await expect(page.locator(".cinemaPortalCopy a")).toHaveAttribute(
    "href",
    "/instituicoes",
  );
  await page
    .getByRole("button", { name: "Pausar efeitos visuais", exact: true })
    .click();
  await expect(portal).not.toHaveClass(/isMotion/);
  await expect(page.locator(".cinemaPortalFrame")).toHaveCSS(
    "clip-path",
    "none",
  );
  expect(errors).toEqual([]);
});

test("how it works has six readable chapters and a working next destination", async ({
  page,
}) => {
  await page.goto("/como-funciona");
  const story = page.locator(".scrollStory-guide");
  // Motion loads on the first interaction, as it does for a real visitor.
  await page.mouse.wheel(0, 1);
  await expect(story).toHaveClass(/isMotion/, { timeout: 20000 });
  await expect(story.locator(".scrollStoryChapter")).toHaveCount(6);
  await page.locator("#story-guide-4").scrollIntoViewIfNeeded();
  await expect(
    story.locator(".scrollStoryChapter[aria-current=step] h3"),
  ).toHaveText("Organize");
  await expect(page.locator("#story-guide-4 a")).toHaveAttribute(
    "href",
    "/perfil",
  );
  await page.locator(".nextChapter a").click();
  await expect(page).toHaveURL(/\/instituicoes/);
  await expect(page.locator(".routeCinemaCopy h1")).toHaveText(
    "Encontre a instituição certa.",
  );
});

test("animated course catalog still filters and compares courses", async ({
  page,
}) => {
  await page.goto("/cursos");
  await expect(page.locator(".routeCinemaVisual")).toBeVisible();
  const search = page.getByLabel("Pesquisar curso, área ou profissão");
  await search.fill("Ciências Contábeis");
  await expect(page.locator(".courseCard")).toHaveCount(1);
  await search.fill("");
  await expect(page.locator(".courseCard").nth(1)).toBeVisible();
  for (const index of [0, 1])
    await page
      .locator(".courseCard")
      .nth(index)
      .getByRole("button", { name: /Comparar/ })
      .click();
  await page.getByRole("button", { name: "Comparar agora" }).click();
  await expect(page.locator(".compareTable")).toBeVisible();
  await expect(page.locator(".compareTable thead th")).toHaveCount(3);
  await expect(page.locator(".verdict h2")).not.toBeEmpty();
});

test("internal pages remain usable on a narrow screen with motion reduced", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 780 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const route of [
    "/instituicoes",
    "/cursos",
    "/comparar",
    "/como-funciona",
    "/sobre",
    "/login",
    "/cadastro",
    "/perfil",
  ]) {
    await page.goto(route, { waitUntil: "domcontentloaded" });
    await expect(page.locator("html")).toHaveAttribute("data-cinema", "off");
    await expect(page.locator("main h1:visible").first()).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      `Horizontal overflow on ${route}`,
    ).toBe(true);
    if (route === "/como-funciona") {
      await expect(
        page.locator(".scrollStoryChapter[aria-hidden=true]"),
      ).toHaveCount(0);
      await expect(page.locator(".scrollStoryVisual")).toHaveCSS(
        "position",
        "relative",
      );
    }
  }
  expect(errors).toEqual([]);
});
