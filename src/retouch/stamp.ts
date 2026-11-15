import type { Image } from '../Image.ts';
import { getOutputImage } from '../utils/getOutputImage.ts';
import { setBlendedPixel } from '../utils/setBlendedPixel.ts';

import type { RetouchOptions } from './retouchUtils.ts';
import { getOverlap, validateRetouchPair } from './retouchUtils.ts';

export type StampOptions = RetouchOptions;

/**
 * Direct stamp (直接盖章): copy the palette onto the negative while keeping
 * the negative where the palette is absent.
 *
 * On images without an alpha channel the covered pixels are replaced by the
 * palette pixels. On images with an alpha channel the palette is composited
 * over the negative with the source-over formula, so a fully transparent
 * palette leaves the negative untouched and a fully opaque palette replaces
 * it. Palette pixels outside of the negative are ignored. The input images
 * are not modified.
 * @param negative - Image being retouched.
 * @param palette - Image stamped on top of the negative.
 * @param options - Stamp options.
 * @returns The stamped image, with the size and color model of the negative.
 */
export function stamp(
  negative: Image,
  palette: Image,
  options: StampOptions = {},
): Image {
  const { origin = { column: 0, row: 0 } } = options;
  validateRetouchPair(negative, palette);

  const result = getOutputImage(negative, options, { clone: true });
  const overlap = getOverlap(negative, palette, origin);
  if (!overlap) {
    return result;
  }

  const { startColumn, endColumn, startRow, endRow } = overlap;
  for (let row = startRow; row < endRow; row++) {
    for (let column = startColumn; column < endColumn; column++) {
      const palettePixel = palette.getPixel(
        column - origin.column,
        row - origin.row,
      );
      setBlendedPixel(result, column, row, palettePixel);
    }
  }

  return result;
}
