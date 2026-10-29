import { test, expect } from "@playwright/test";

test("carousel changes image and copy, supports manual controls and pauses", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page.locator(".filmTitle")).toContainText("capítulo");
  await expect(page.locator(".filmFrame.isActive")).toHaveClass(/students/);
  await page.getByRole("button", { name: "Próxima cena", exact: true }).click();
  await expect(page.locator(".filmTitle")).toContainText("vai além");
  await expect(page.locator(".filmFrame.isActive")).toHaveClass(/campus/);
  await page
    .getByRole("button", { name: "Pausar carrossel", exact: true })
    .click();
  await page.locator(".filmDescription").click();
  await expect(page.locator(".filmHero")).toHaveAttribute(
    "data-running",
    "false",
  );
  await page.waitForTimeout(6200);
  await expect(page.locator(".filmSceneCount b")).toHaveText("02");
  await expect(
    page.getByRole("link", { name: "Conhecer instituições", exact: true }),
  ).toHaveAttribute("href", "/instituicoes");
  expect(errors).toEqual([]);
});

test("scroll storytelling changes chapters and responds to navigation", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator(".filmJourney")).toHaveClass(/isEnhanced/);
  await page.evaluate(() => {
    const section = document.querySelector<HTMLElement>(".filmJourney")!;
    window.scrollTo({
      top:
        section.getBoundingClientRect().top +
        scrollY +
        (section.offsetHeight - innerHeight) * 0.55,
      behavior: "instant",
    });
  });
  await expect(page.locator(".filmJourneyScene.isActive h2")).toContainText(
    "Compare.",
  );
  await page.getByRole("button", { name: "03 Escolha", exact: true }).click();
  await expect(page.locator(".filmJourneyScene.isActive h2")).toContainText(
    "Escolha.",
  );
  await expect(page.locator(".filmJourneyScene.isActive a")).toHaveJSProperty(
    "tabIndex",
    0,
  );
  await expect(
    page.locator(".filmJourneyScene:not(.isActive) a").first(),
  ).toHaveAttribute("tabindex", "-1");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("institution gallery keeps details, comparison and navigation working", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator(".filmGalleryItem").first()).toBeVisible();
  const gallery = page.locator(".filmInstitutionGallery");
  await page
    .getByRole("button", { name: "Próximas instituições", exact: true })
    .click();
  await expect
    .poll(() => gallery.evaluate((el) => el.scrollLeft))
    .toBeGreaterThan(100);
  await page
    .getByRole("button", { name: "Instituições anteriores", exact: true })
    .click();
  await expect
    .poll(() => gallery.evaluate((el) => el.scrollLeft))
    .toBeLessThan(5);
  await page
    .locator(".filmGalleryItem")
    .first()
    .getByRole("button", { name: /Comparar/ })
    .click();
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          JSON.parse(localStorage.getItem("matriculou-compare") || "[]").length,
      ),
    )
    .toBe(1);
  await page
    .locator(".filmGalleryItem")
    .first()
    .getByRole("button", { name: /Ver detalhes/ })
    .click();
  await expect(page.locator(".modalLayer")).toBeVisible();
  await expect(page.locator(".modalHead h2")).not.toBeEmpty();
});

test("motion control persists across routes and restores visible content", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Pausar efeitos visuais", exact: true })
    .click();
  await expect(page.locator("html")).toHaveAttribute("data-cinema", "off");
  await expect(page.locator(".filmJourney")).not.toHaveClass(/isEnhanced/);
  await page
    .locator(".navLinks")
    .getByRole("link", { name: "Cursos", exact: true })
    .click();
  await expect(page).toHaveURL(/\/cursos/);
  await expect(page.locator("html")).toHaveAttribute("data-cinema", "off");
  await expect(
    page.getByRole("heading", { name: "Entenda antes de escolher." }),
  ).toBeVisible();
});

test("mobile and reduced motion preserve the layout and all story chapters", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    baseURL,
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-cinema", "off");
  await expect(page.locator(".filmJourney")).not.toHaveClass(/isEnhanced/);
  await expect(page.locator(".filmJourneyScene")).toHaveCount(3);
  await expect(page.locator(".filmHero")).toHaveAttribute(
    "data-running",
    "false",
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Abrir menu", exact: true }).click();
  await expect(page.locator(".drawer")).toBeVisible();
  await context.close();
});

test("all five scenes fit narrow screens and short windows keep chapters accessible", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1366, height: 600 });
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-cinema", "on");
  await expect(page.locator(".filmJourney")).not.toHaveClass(/isEnhanced/);
  await expect(page.locator(".filmJourneyScene[aria-hidden=true]")).toHaveCount(
    0,
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const width of [320, 390, 768]) {
    await page.setViewportSize({ width, height: 844 });
    for (let scene = 1; scene <= 5; scene++) {
      await page
        .getByRole("button", { name: new RegExp(`^Ver cena ${scene}:`) })
        .click();
      await expect(page.locator(".filmSceneCount b")).toHaveText(`0${scene}`);
      const clippedLines = await page
        .locator(".filmTitleMask")
        .evaluateAll((lines) =>
          lines
            .filter((line) => line.scrollWidth > line.clientWidth + 1)
            .map((line) => line.textContent),
        );
      expect(
        clippedLines,
        `Cropped headline at ${width}px, scene ${scene}`,
      ).toEqual([]);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
    }
  }
});
