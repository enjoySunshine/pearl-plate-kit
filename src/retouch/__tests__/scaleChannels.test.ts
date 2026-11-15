import { expect, test } from 'vitest';

import { scaleChannels } from '../scaleChannels.ts';

test('grey values doubled, clamped at the maximum', () => {
  const image = testUtils.createGreyImage([[10, 200]]);

  const result = scaleChannels(image, 2);

  expect(result).toMatchImageData([[20, 255]]);
});

test('only the selected channels are scaled, blue and alpha untouched', () => {
  const image = testUtils.createRgbaImage([[10, 20, 30, 100]]);

  const result = image.scaleChannels(0.5, { channels: [0, 1] });

  expect(result).toMatchImageData([[5, 10, 30, 100]]);
});

test('alpha is not scaled by default', () => {
  const image = testUtils.createRgbaImage([[10, 20, 30, 100]]);

  const result = scaleChannels(image, 2);

  expect(result).toMatchImageData([[20, 40, 60, 100]]);
});

test('factor 0 darkens the selected channels', () => {
  const image = testUtils.createGreyImage([[10, 200]]);

  const result = scaleChannels(image, 0);

  expect(result).toMatchImageData([[0, 0]]);
});

test('negative factor throws', () => {
  const image = testUtils.createGreyImage([[10, 200]]);

  expect(() => scaleChannels(image, -1)).toThrow(/factor/);
});

test('input image is not modified', () => {
  const image = testUtils.createGreyImage([[10, 200]]);

  scaleChannels(image, 2);

  expect(image).toMatchImageData([[10, 200]]);
});
