import { markSize } from "./mark.ts";

export interface WordmarkPath {
  d: string;
  width: number;
  height: number;
}

export interface Lockup {
  width: number;
  height: number;
  markScale: number;
  textX: number;
  textY: number;
}

export function lockup(wordmark: WordmarkPath): Lockup {
  const markSide = wordmark.height * 1.18;
  const gap = wordmark.height * 0.42;
  return {
    width: Math.round(markSide + gap + wordmark.width),
    height: Math.round(markSide),
    markScale: markSide / markSize,
    textX: markSide + gap,
    textY: (markSide - wordmark.height) / 2,
  };
}
