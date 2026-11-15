import { expect, test } from 'vitest';

import { screenBlend } from '../screenBlend.ts';

test('grey palette starting at column 2: only the overlapping pixel changes', () => {
  const negative = testUtils.createGreyImage([[10, 80, 90]]);
  const palette = testUtils.createGreyImage([[20, 40]]);

  const result = screenBlend(negative, palette, {
    origin: { column: 2, row: 0 },
  });

  // 255 - (255 - 90) * (255 - 20) / 255 = 102.94 -> 103.
  expect(result).toMatchImageData([[10, 80, 103]]);
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

  const result = screenBlend(negative, palette);

  expect(result).toMatchImageData([
    [29, 209],
    [128, 255],
  ]);
});

test('palette fully outside the negative leaves the negative unchanged', () => {
  const negative = testUtils.createGreyImage([[10, 80, 90]]);
  const palette = testUtils.createGreyImage([[20, 40]]);

  const result = screenBlend(negative, palette, {
    origin: { column: -3, row: 0 },
  });

  expect(result).toMatchImageData([[10, 80, 90]]);
});

test('input images are not modified', () => {
  const negative = testUtils.createGreyImage([[10, 80, 90]]);
  const palette = testUtils.createGreyImage([[20, 40]]);

  screenBlend(negative, palette, { origin: { column: 2, row: 0 } });

  expect(negative).toMatchImageData([[10, 80, 90]]);
  expect(palette).toMatchImageData([[20, 40]]);
});
