import { mkdirSync } from "node:fs";
import { chromium } from "playwright";

const [baseUrl, outputDir] = process.argv.slice(2);
if (baseUrl === undefined || outputDir === undefined) {
  throw new Error("Usage: node scripts/capture.ts <base-url> <output-dir>");
}

const pages = [
  { name: "home", path: "/" },
  { name: "privacy", path: "/privacy" },
  { name: "404", path: "/missing-page" },
];
const widths = [360, 1440];
const schemes = ["light", "dark"] as const;

mkdirSync(outputDir, { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  for (const scheme of schemes) {
    for (const width of widths) {
      const context = await browser.newContext({
        baseURL: baseUrl,
        colorScheme: scheme,
        viewport: { width, height: 900 },
        deviceScaleFactor: 2,
      });
      const page = await context.newPage();
      for (const entry of pages) {
        await page.goto(new URL(entry.path, baseUrl).href, {
          waitUntil: "networkidle",
        });
        await page.evaluate(async () => {
          for (let y = 0; y < document.body.scrollHeight; y += 400) {
            window.scrollTo(0, y);
            await new Promise((resolve) => setTimeout(resolve, 60));
          }
          window.scrollTo(0, 0);
          await document.fonts.ready;
        });
        await page.waitForTimeout(1200);
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth > window.innerWidth,
        );
        if (overflow) {
          throw new Error(
            `${entry.name} scrolls sideways at ${String(width)} px`,
          );
        }
        await page.screenshot({
          path: `${outputDir}/${entry.name}-${String(width)}-${scheme}.png`,
          fullPage: true,
        });
      }
      await context.close();
    }
  }
} finally {
  await browser.close();
}
