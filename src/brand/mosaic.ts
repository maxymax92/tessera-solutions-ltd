export type Tone = "faint" | "soft" | "ink" | "accent";

export interface MosaicTile {
  column: number;
  row: number;
  tone: Tone;
}

export const mosaicGrid = {
  columns: 11,
  rows: 9,
  cell: 34,
  tile: 28,
  radius: 4,
  faint: 6,
  soft: 14,
};

function toneFor(roll: number, weight: number): Tone {
  if (roll < 0.07 && weight > 0.5) {
    return "accent";
  }
  if (roll < weight * 0.12) {
    return "ink";
  }
  if (roll < weight * 0.5) {
    return "soft";
  }
  return "faint";
}

function noise(column: number, row: number): number {
  const seed = Math.sin(column * 127.1 + row * 311.7) * 43758.5453;
  return seed - Math.floor(seed);
}

export function mosaic(): MosaicTile[] {
  const { columns, rows } = mosaicGrid;
  const tiles: MosaicTile[] = [];
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const weight =
        (column / (columns - 1)) * 0.75 + (1 - row / (rows - 1)) * 0.25;
      const roll = noise(column, row);
      if (roll > weight) {
        continue;
      }
      tiles.push({ column, row, tone: toneFor(roll, weight) });
    }
  }
  return tiles;
}
