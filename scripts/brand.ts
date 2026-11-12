import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { openSync, type Font } from "fontkit";
import { chromium } from "playwright";
import { lockup, type WordmarkPath } from "../src/brand/lockup.ts";
import {
  filledMarkRects,
  markRects,
  markSize,
  markSvg,
  palette,
} from "../src/brand/mark.ts";
import { mosaic, mosaicGrid, type Tone } from "../src/brand/mosaic.ts";
import { company } from "../src/site.ts";

const root = fileURLToPath(new URL("..", import.meta.url));
const fontFile = `${root}node_modules/geist/dist/fonts/geist-sans/Geist-Variable.ttf`;
const webFontFile = `${root}node_modules/@fontsource-variable/geist/files/geist-latin-wght-normal.woff2`;
const weight = 580;
const tracking = -0.018;

function loadFont(): Font {
  const opened = openSync(fontFile);
  if (!("getVariation" in opened)) {
    throw new Error(`Expected a single font in ${fontFile}`);
  }
  return opened.getVariation({ wght: weight });
}

function wordmarkPath(font: Font): WordmarkPath {
  const run = font.layout(company.shortName);
  const height = font.capHeight;
  const spacing = tracking * font.unitsPerEm;
  let pen = 0;
  const parts = run.glyphs.map((glyph, index) => {
    const position = run.positions[index];
    if (position === undefined) {
      throw new Error(`Missing position for glyph ${String(index)}`);
    }
    const d = glyph.path
      .scale(1, -1)
      .translate(pen + position.xOffset, height)
      .toSVG();
    pen += position.xAdvance + spacing;
    return d;
  });
  return { d: parts.join(""), width: Math.round(pen - spacing), height };
}

const wordmark = wordmarkPath(loadFont());
const box = lockup(wordmark);
const share = { width: 1200, height: 630 };
const icon = 180;

function lockupSvg(ink: string, accent: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${String(box.width)} ${String(box.height)}" role="img" aria-label="${company.shortName}"><g transform="scale(${String(box.markScale)})">${filledMarkRects(ink, accent)}</g><path transform="translate(${String(box.textX)} ${String(box.textY)})" fill="${ink}" d="${wordmark.d}"/></svg>`;
}

const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${String(markSize)} ${String(markSize)}"><style>rect{fill:${palette.ink}}.a{fill:${palette.terracotta}}@media (prefers-color-scheme:dark){rect{fill:${palette.chalk}}.a{fill:${palette.terracottaNight}}}</style>${markRects((tile) => (tile.accent ? 'class="a"' : ""))}</svg>`;

const { columns, rows, cell, tile, radius } = mosaicGrid;
const toneFill: Record<Tone, string> = {
  faint: `color-mix(in oklch, ${palette.ink} ${String(mosaicGrid.faint)}%, transparent)`,
  soft: `color-mix(in oklch, ${palette.ink} ${String(mosaicGrid.soft)}%, transparent)`,
  ink: palette.ink,
  accent: palette.terracotta,
};
const field = mosaic()
  .map(
    (square) =>
      `<rect x="${String(square.column * cell)}" y="${String(square.row * cell)}" width="${String(tile)}" height="${String(tile)}" rx="${String(radius)}" fill="${toneFill[square.tone]}"/>`,
  )
  .join("");

const fontData = readFileSync(webFontFile).toString("base64");
const shareHtml = `<!doctype html><html><head><style>
@font-face{font-family:Geist;src:url(data:font/woff2;base64,${fontData}) format("woff2");font-weight:100 900}
html,body{margin:0}
body{width:${String(share.width)}px;height:${String(share.height)}px;background:${palette.paper};color:${palette.ink};font-family:Geist;padding:84px 96px;box-sizing:border-box;position:relative;overflow:hidden;display:flex;flex-direction:column;justify-content:space-between}
.lockup svg{height:60px;width:auto;display:block}
.field{position:absolute;right:-6px;top:-6px;width:${String(columns * cell)}px}
h1{font-size:64px;line-height:1.05;letter-spacing:-0.035em;font-weight:600;margin:0;max-width:760px}
p{font-size:24px;color:${palette.muted};margin:24px 0 0}
</style></head><body>
<svg class="field" viewBox="0 0 ${String(columns * cell)} ${String(rows * cell)}">${field}</svg>
<div class="lockup">${lockupSvg(palette.ink, palette.terracotta)}</div>
<div><h1>Bespoke software, technical delivery and our own products.</h1><p>tesserasolutions.co.uk</p></div>
</body></html>`;

const iconHtml = `<!doctype html><html><head><style>html,body{margin:0}body{width:${String(icon)}px;height:${String(icon)}px;background:${palette.paper};display:grid;place-items:center}svg{width:124px;height:124px}</style></head><body>${markSvg(palette.ink, palette.terracotta)}</body></html>`;

mkdirSync(`${root}public/brand`, { recursive: true });
const files = {
  "src/brand/wordmark.json": `${JSON.stringify(wordmark, null, 2)}\n`,
  "public/favicon.svg": favicon,
  "public/brand/tessera-mark.svg": markSvg(palette.ink, palette.terracotta),
  "public/brand/tessera-mark-dark.svg": markSvg(
    palette.chalk,
    palette.terracottaNight,
  ),
  "public/brand/tessera-wordmark.svg": lockupSvg(
    palette.ink,
    palette.terracotta,
  ),
  "public/brand/tessera-wordmark-dark.svg": lockupSvg(
    palette.chalk,
    palette.terracottaNight,
  ),
};
for (const [path, content] of Object.entries(files)) {
  writeFileSync(`${root}${path}`, content);
}

const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  const page = await browser.newPage({ viewport: share });
  await page.setContent(shareHtml);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: `${root}public/og.png` });
  await page.setViewportSize({ width: icon, height: icon });
  await page.setContent(iconHtml);
  await page.screenshot({ path: `${root}public/apple-touch-icon.png` });
} finally {
  await browser.close();
}
