import { expect, test } from 'vitest';

import { multiplyBlend } from '../multiplyBlend.ts';

test('grey palette starting at column 2: only the overlapping pixel changes', () => {
  const negative = testUtils.createGreyImage([[10, 80, 90]]);
  const palette = testUtils.createGreyImage([[20, 40]]);

  const result = multiplyBlend(negative, palette, {
    origin: { column: 2, row: 0 },
  });

  // Palette 20 covers negative column 2 (value 90): 90 * 20 / 255 = 7.06 -> 7.
  // Palette 40 falls outside of the negative and never appears.
  expect(result).toMatchImageData([[10, 80, 7]]);
});

test('aligned 2x2 grey images', () => {
  const negative = testUtils.createGreyImage([
    [10, 200],
    [0, 255],
  ]);
  const palette = testUtils.createGreyImage([
    [20, 40],
    [128, 255],
  ]);

  const result = multiplyBlend(negative, palette);

  expect(result).toMatchImageData([
    [1, 31],
    [0, 255],
  ]);
});

test('RGBA: color channels are blended, alpha stays untouched', () => {
  const negative = testUtils.createRgbaImage([[10, 20, 30, 100]]);
  const palette = testUtils.createRgbaImage([[40, 50, 60, 200]]);

  const result = negative.multiplyBlend(palette);

  expect(result).toMatchImageData([[2, 4, 7, 100]]);
});

test('palette fully outside the negative leaves the negative unchanged', () => {
  const negative = testUtils.createGreyImage([[10, 80, 90]]);
  const palette = testUtils.createGreyImage([[20, 40]]);

  const result = multiplyBlend(negative, palette, {
    origin: { column: 5, row: 0 },
  });

  expect(result).toMatchImageData([[10, 80, 90]]);
});

test('input images are not modified', () => {
  const negative = testUtils.createGreyImage([[10, 80, 90]]);
  const palette = testUtils.createGreyImage([[20, 40]]);

  multiplyBlend(negative, palette, { origin: { column: 2, row: 0 } });

  expect(negative).toMatchImageData([[10, 80, 90]]);
  expect(palette).toMatchImageData([[20, 40]]);
});

test('incompatible color models throw', () => {
  const negative = testUtils.createGreyImage([[10, 80, 90]]);
  const palette = testUtils.createRgbImage([[20, 40, 60]]);

  expect(() => multiplyBlend(negative, palette)).toThrow(/same color model/);
});
