import type { Image } from '../Image.ts';
import type { Point } from '../geometry/index.ts';
import { checkPointIsInteger } from '../utils/validators/checkPointIsInteger.ts';

export interface RetouchOptions {
  /**
   * Top-left corner of the palette on the negative, measured from the
   * left edge of the negative. Columns of the palette that fall outside
   * the negative are ignored.
   * @default `{ column: 0, row: 0 }`
   */
  origin?: Point;
  /**
   * Image to which the resulting image has to be put.
   */
  out?: Image;
}

/**
 * Round a value to the nearest integer, halves going up (四舍五入).
 * All blend results are non-negative, so `Math.floor(value + 0.5)` is enough.
 * @param value - Value to round.
 * @returns The rounded integer.
 */
export function roundHalfUp(value: number): number {
  return Math.floor(value + 0.5);
}

/**
 * Check that the palette can be laid on top of the negative: both images
 * must share the same bit depth, color model and therefore channel layout.
 * @param negative - Image being retouched.
 * @param palette - Image laid on top of the negative.
 */
export function validateRetouchPair(negative: Image, palette: Image): void {
  if (negative.bitDepth !== palette.bitDepth) {
    throw new RangeError('both images must have the same bit depth');
  }
  if (negative.colorModel !== palette.colorModel) {
    throw new RangeError('both images must have the same color model');
  }
}

/**
 * Intersection between a palette positioned at `origin` and the negative,
 * expressed in negative coordinates, together with the matching palette
 * coordinates. Pixels outside of the negative are never visited.
 * @param negative - Image being retouched.
 * @param palette - Image laid on top of the negative.
 * @param origin - Top-left corner of the palette on the negative.
 * @returns The overlapping region, or `undefined` when there is none.
 */
export function getOverlap(
  negative: Image,
  palette: Image,
  origin: Point,
):
  | {
      startColumn: number;
      endColumn: number;
      startRow: number;
      endRow: number;
    }
  | undefined {
  checkPointIsInteger(origin, 'Origin');
  const { column, row } = origin;

  const startColumn = Math.max(column, 0);
  const startRow = Math.max(row, 0);
  const endColumn = Math.min(column + palette.width, negative.width);
  const endRow = Math.min(column + palette.height, negative.height);

  if (startColumn >= endColumn || startRow >= endRow) {
    return undefined;
  }

  return { startColumn, endColumn, startRow, endRow };
}
