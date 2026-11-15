import { expect, test } from 'vitest';

import { stamp } from '../stamp.ts';

test('RGBA source-over compositing with a semi-transparent palette', () => {
  const negative = testUtils.createRgbaImage([[10, 20, 30, 100]]);
  const palette = testUtils.createRgbaImage([[40, 50, 60, 128]]);

  const result = stamp(negative, palette);

  expect(result).toMatchImageData([[31, 41, 51, 177]]);
});

test('fully transparent palette leaves the negative untouched', () => {
  const negative = testUtils.createRgbaImage([[10, 20, 30, 100]]);
  const palette = testUtils.createRgbaImage([[40, 50, 60, 0]]);

  const result = negative.stamp(palette);

  expect(result).toMatchImageData([[10, 20, 30, 100]]);
});

test('fully opaque palette replaces the pixel', () => {
  const negative = testUtils.createRgbaImage([[10, 20, 30, 100]]);
  const palette = testUtils.createRgbaImage([[40, 50, 60, 255]]);

  const result = stamp(negative, palette);

  expect(result).toMatchImageData([[40, 50, 60, 255]]);
});

test('grey palette replaces covered pixels, the rest of the negative stays', () => {
  const negative = testUtils.createGreyImage([[10, 200]]);
  const palette = testUtils.createGreyImage([[20, 40]]);

  const result = stamp(negative, palette, {
    origin: { column: 1, row: 0 },
  });

  // Only palette column 0 (value 20) fits, covering negative column 1.
  expect(result).toMatchImageData([[10, 20]]);
});

test('palette fully outside the negative leaves it untouched', () => {
  const negative = testUtils.createGreyImage([[10, 200]]);
  const palette = testUtils.createGreyImage([[20, 40]]);

  const result = stamp(negative, palette, {
    origin: { column: 5, row: 0 },
  });

  expect(result).toMatchImageData([[10, 200]]);
});

test('input images are not modified', () => {
  const negative = testUtils.createRgbaImage([[10, 20, 30, 100]]);
  const palette = testUtils.createRgbaImage([[40, 50, 60, 128]]);

  stamp(negative, palette);

  expect(negative).toMatchImageData([[10, 20, 30, 100]]);
  expect(palette).toMatchImageData([[40, 50, 60, 128]]);
});
