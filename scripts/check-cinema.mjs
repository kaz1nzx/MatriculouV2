import { chromium } from "@playwright/test";
import fs from "node:fs";
fs.mkdirSync("artifacts/cinema", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 980 },
  });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("http://localhost:3000", {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  });
  await page.locator(".filmGalleryItem").first().waitFor({ timeout: 35000 });
  await page
    .locator(".filmFrame.isActive img")
    .evaluate((image) => image.decode());
  await page.waitForTimeout(1800);
  await page.screenshot({ path: "artifacts/cinema/desktop-opening.png" });
  await page.locator(".filmDiscovery").scrollIntoViewIfNeeded();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: "artifacts/cinema/desktop-discovery.png" });
  await page.evaluate(() => {
    const section = document.querySelector(".filmJourney");
    scrollTo({
      top: section.getBoundingClientRect().top + scrollY + 500,
      behavior: "instant",
    });
  });
  await page.waitForTimeout(1100);
  await page.screenshot({ path: "artifacts/cinema/desktop-story.png" });
  console.log(
    JSON.stringify({
      errors,
      storyEnhanced: await page.locator(".filmJourney").getAttribute("class"),
      desktopOverflow: await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
    }),
  );
  const mobile = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    reducedMotion: "reduce",
  });
  const mobilePage = await mobile.newPage();
  await mobilePage.goto("http://localhost:3000", {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  });
  await mobilePage.locator(".filmGalleryItem").first().waitFor();
  await mobilePage
    .locator(".filmFrame.isActive img")
    .evaluate((image) => image.decode());
  await mobilePage.screenshot({ path: "artifacts/cinema/mobile-opening.png" });
  await mobilePage.screenshot({
    path: "artifacts/cinema/mobile-full.png",
    fullPage: true,
  });
  console.log(
    JSON.stringify({
      mobileOverflow: await mobilePage.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      mobileWideElements: await mobilePage.evaluate(() =>
        [...document.querySelectorAll("body *")]
          .filter(
            (el) =>
              el.getBoundingClientRect().right > innerWidth + 2 &&
              getComputedStyle(el).position !== "absolute",
          )
          .slice(0, 12)
          .map((el) => ({
            tag: el.tagName,
            class: el.className,
            width: el.getBoundingClientRect().width,
          })),
      ),
    }),
  );
} finally {
  await browser.close();
}
