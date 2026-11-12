export interface Tile {
  x: number;
  y: number;
  accent: boolean;
}

export const markSize = 32;
export const tileSize = 8;
export const tileRadius = 1.5;

const step = 10;
const inset = (markSize - (2 * step + tileSize)) / 2;

const cells: readonly (readonly [number, number])[] = [
  [0, 0],
  [1, 0],
  [2, 0],
  [1, 1],
  [1, 2],
];

export const tiles: readonly Tile[] = cells.map(([column, row]) => ({
  x: inset + column * step,
  y: inset + row * step,
  accent: column === 2 && row === 0,
}));

export const palette = {
  paper: "#fbfaf7",
  ink: "#1a1511",
  muted: "#5d5751",
  night: "#110e0b",
  chalk: "#f1eeea",
  terracotta: "#c95a37",
  terracottaNight: "#e67e54",
};

export function markRects(attributes: (tile: Tile) => string): string {
  return tiles
    .map(
      (tile) =>
        `<rect x="${String(tile.x)}" y="${String(tile.y)}" width="${String(tileSize)}" height="${String(tileSize)}" rx="${String(tileRadius)}" ${attributes(tile)}/>`,
    )
    .join("");
}

export function filledMarkRects(ink: string, accent: string): string {
  return markRects((tile) => `fill="${tile.accent ? accent : ink}"`);
}

export function markSvg(ink: string, accent: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${String(markSize)} ${String(markSize)}">${filledMarkRects(ink, accent)}</svg>`;
}
