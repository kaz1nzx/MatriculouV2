import { chromium } from "@playwright/test";
import fs from "node:fs";

fs.mkdirSync("artifacts/editorial", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 980 },
  });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("http://localhost:3000");
  await page.locator(".filmFrame.isActive img").evaluate((img) => img.decode());
  await page
    .getByRole("button", { name: "Pausar carrossel", exact: true })
    .click();
  await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
  await page.waitForTimeout(1200);
  await page.screenshot({ path: "artifacts/editorial/home-desktop.png" });
  for (const [selector, name] of [
    [".filmDiscovery", "institutions"],
    [".atlasSection", "atlas"],
  ]) {
    await page.locator(selector).scrollIntoViewIfNeeded();
    await page.waitForTimeout(1200);
    await page.screenshot({ path: `artifacts/editorial/${name}.png` });
  }
  await page
    .getByRole("button", { name: "Abrir assistente", exact: true })
    .click();
  await page.screenshot({ path: "artifacts/editorial/chat.png" });
  await page.keyboard.press("Escape");
  const links = await page
    .locator("a[href]")
    .evaluateAll((elements) => [
      ...new Set(
        elements
          .map((el) => el.getAttribute("href"))
          .filter((href) => href.startsWith("/")),
      ),
    ]);
  const routes = [...new Set(links.map((href) => href.split(/[?#]/)[0]))];
  const status = [];
  for (const route of routes)
    status.push({
      route,
      status: (
        await page.request.get(`http://localhost:3000${route}`)
      ).status(),
    });
  await page.goto("http://localhost:3000/rota-inexistente");
  await page.screenshot({ path: "artifacts/editorial/404-desktop.png" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("http://localhost:3000");
  await page.locator(".filmFrame.isActive img").evaluate((img) => img.decode());
  await page.screenshot({ path: "artifacts/editorial/home-mobile.png" });
  await page
    .getByRole("button", { name: "Abrir assistente", exact: true })
    .click();
  await page.screenshot({ path: "artifacts/editorial/chat-mobile.png" });
  console.log(
    JSON.stringify(
      {
        errors,
        routes: status,
        mobileOverflow: await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
      },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
}
