import { FastAverageColor, FastAverageColorResult } from 'fast-average-color';

/**
 * Returns the dominant color of an image in rgb.
 * @param imgUrl base64 string url of the image
 * @returns
 */
export async function getDominantColor(imgUrl: string): Promise<FastAverageColorResult> {
  const blob = await getBlobFromBase64String(imgUrl);
  const bitmap = await createImageBitmap(blob);

  const fac = new FastAverageColor();
  return fac.getColor(bitmap);
}

async function getBlobFromBase64String(imgData: string): Promise<Blob> {
  if (!imgData) throw new Error('Image data is undefined or empty');

  return (await fetch(imgData)).blob();
}

export function getImgUrlFromData(imgData: string): string {
  if (!imgData) throw new Error('Image data is undefined or empty');

  return `data:image/jpeg;base64,${imgData}`;
}

export async function backgroundImageExists(): Promise<boolean> {
  return (await window.data.getBackgroundImage()) !== undefined;
}
