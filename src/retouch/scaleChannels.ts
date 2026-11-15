import type { Image } from '../Image.ts';
import { getOutputImage } from '../utils/getOutputImage.ts';
import { assert } from '../utils/validators/assert.ts';
import { validateChannels } from '../utils/validators/validators.ts';

import { roundHalfUp } from './retouchUtils.ts';

export interface ScaleChannelsOptions {
  /**
   * Channels to which the factor is applied.
   * @default every channel except the alpha channel
   */
  channels?: number[];
  /**
   * Image to which the resulting image has to be put.
   */
  out?: Image;
}

/**
 * Scale the selected channels of an image by a constant factor (放到几倍 /
 * 收到一半). Each selected value is multiplied by the factor, rounded to the
 * nearest integer and clamped to the image range, so a value cannot go past
 * the maximum (e.g. 200 doubled on an 8-bit image stops at 255).
 *
 * The alpha channel is scaled only when it is explicitly included in
 * `channels`. The input image is not modified.
 * @param image - Image to scale.
 * @param factor - Multiplication factor, must be a non-negative number.
 * @param options - Scale options.
 * @returns The scaled image.
 */
export function scaleChannels(
  image: Image,
  factor: number,
  options: ScaleChannelsOptions = {},
): Image {
  const {
    channels = new Array(image.components)
      .fill(0)
      .map((_value, index) => index),
  } = options;
  validateChannels(channels, image);
  assert(Number.isFinite(factor) && factor >= 0, 'factor must be >= 0');

  const result = getOutputImage(image, options, { clone: true });
  if (channels.length === 0 || factor === 1) {
    return result;
  }

  const maxValue = image.maxValue;
  for (const channel of channels) {
    for (let row = 0; row < result.height; row++) {
      for (let column = 0; column < result.width; column++) {
        const value = image.getValue(column, row, channel);
        const scaled = Math.min(maxValue, roundHalfUp(value * factor));
        result.setValue(column, row, channel, scaled);
      }
    }
  }

  return result;
}
