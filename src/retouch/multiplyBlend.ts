import type { Image } from '../Image.ts';
import { getOutputImage } from '../utils/getOutputImage.ts';

import type { RetouchOptions } from './retouchUtils.ts';
import {
  getOverlap,
  roundHalfUp,
  validateRetouchPair,
} from './retouchUtils.ts';

export type MultiplyBlendOptions = RetouchOptions;

/**
 * Multiply blend mode (正片叠底): lay the palette on the negative and
 * multiply the overlapping color channels component-wise.
 *
 * For 8-bit images the result of every channel is
 * `round(negative * palette / 255)`, rounded to the nearest integer.
 * The alpha channel is left untouched and palette pixels that fall outside
 * of the negative are ignored. The input images are not modified.
 * @param negative - Image being retouched.
 * @param palette - Image laid on top of the negative.
 * @param options - Blend options.
 * @returns The blended image, with the size and color model of the negative.
 */
export function multiplyBlend(
  negative: Image,
  palette: Image,
  options: MultiplyBlendOptions = {},
): Image {
  const { origin = { column: 0, row: 0 } } = options;
  validateRetouchPair(negative, palette);

  const result = getOutputImage(negative, options, { clone: true });
  const overlap = getOverlap(negative, palette, origin);
  if (!overlap) {
    return result;
  }

  const maxValue = negative.maxValue;
  const { startColumn, endColumn, startRow, endRow } = overlap;
  for (let row = startRow; row < endRow; row++) {
    for (let column = startColumn; column < endColumn; column++) {
      const paletteColumn = column - origin.column;
      const paletteRow = row - origin.row;
      for (let channel = 0; channel < negative.components; channel++) {
        const baseValue = negative.getValue(column, row, channel);
        const paletteValue = palette.getValue(
          paletteColumn,
          paletteRow,
          channel,
        );
        const blended = roundHalfUp((baseValue * paletteValue) / maxValue);
        result.setValue(column, row, channel, blended);
      }
    }
  }

  return result;
}
