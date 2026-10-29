import { chromium } from "@playwright/test";
const out = process.argv[2],
  pages = process.argv.slice(3);
const b = await chromium.launch({ channel: "chrome" });
for (const vp of [
  { w: 1440, h: 900, n: "d" },
  { w: 390, h: 844, n: "m" },
]) {
  const ctx = await b.newContext({ viewport: { width: vp.w, height: vp.h } });
  await ctx.addInitScript(() =>
    localStorage.setItem(
      "matriculou-consent",
      JSON.stringify({
        version: 1,
        decidedAt: new Date().toISOString(),
        analytics: false,
        marketing: false,
      }),
    ),
  );
  const p = await ctx.newPage();
  for (const path of pages) {
    await p
      .goto("http://localhost:3000" + path, { waitUntil: "networkidle" })
      .catch(() => {});
    await p.waitForTimeout(1200);
    await p.screenshot({
      path: `${out}/${vp.n}${path.replace(/[^a-z]/g, "_")}.png`,
      fullPage: vp.n === "d" ? false : false,
    });
  }
  await ctx.close();
}
await b.close();
