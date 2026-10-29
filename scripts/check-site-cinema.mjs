import { chromium } from "@playwright/test";
import fs from "node:fs";

fs.mkdirSync("artifacts/cinema-expansion", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 980 },
  });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("http://localhost:3000/cursos");
  await page
    .locator(".routeCinemaPicture img")
    .evaluate((image) => image.decode());
  await page.waitForTimeout(1200);
  await page.screenshot({
    path: "artifacts/cinema-expansion/courses-desktop.png",
  });
  await page.goto("http://localhost:3000/como-funciona");
  await page.locator("#story-guide-2").scrollIntoViewIfNeeded();
  await page.waitForTimeout(1300);
  await page.screenshot({
    path: "artifacts/cinema-expansion/guide-desktop.png",
  });
  await page.goto("http://localhost:3000");
  await page.locator("#story-possibilities-1").scrollIntoViewIfNeeded();
  await page.waitForTimeout(1300);
  await page.screenshot({
    path: "artifacts/cinema-expansion/story-desktop.png",
  });
  await page.evaluate(() => {
    const portal = document.querySelector(".cinemaPortal");
    scrollTo({
      top:
        portal.getBoundingClientRect().top +
        scrollY +
        (portal.offsetHeight - innerHeight) * 0.9,
      behavior: "instant",
    });
  });
  await page.waitForTimeout(1300);
  await page.screenshot({
    path: "artifacts/cinema-expansion/horizon-desktop.png",
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("http://localhost:3000/cursos");
  await page.screenshot({
    path: "artifacts/cinema-expansion/courses-mobile.png",
  });
  await page.goto("http://localhost:3000/como-funciona");
  await page.screenshot({
    path: "artifacts/cinema-expansion/guide-mobile.png",
    fullPage: true,
  });
  console.log(JSON.stringify({ errors }));
} finally {
  await browser.close();
}
