import { Color, Solver } from '@remindr/shared';
import isHexColor from 'validator/lib/isHexColor';

export function rgbStringToArr(rgbString: string): number[] {
  const components = rgbString.substring(4, rgbString.length - 1).split(',');

  if (components.length === 3) {
    const r = parseInt(components[0], 10);
    const g = parseInt(components[1], 10);
    const b = parseInt(components[2], 10);

    return [r, g, b];
  }

  throw new Error('Invalid RGB string provided');
}

export function rgbArrToString(rgbArr: number[]): string {
  return `rgb(${rgbArr[0]}, ${rgbArr[1]}, ${rgbArr[2]})`;
}

// Color Blending (Used to darken/lighten colors)
function RGBLinearShade(rgbArr: number[], strength: number) {
  const [r, g, b] = rgbArr;
  const darken = strength < 0;
  const t = darken ? 0 : 255 * strength;
  const Q = darken ? 1 + strength : 1 - strength;
  return [Math.round(r * Q + t), Math.round(g * Q + t), Math.round(b * Q + t)];
}

export function getColorFilter(rgbArr: number[]): string {
  const filterColor = new Color(rgbArr[0], rgbArr[1], rgbArr[2]);
  const solver = new Solver(filterColor);
  const result = solver.solve();
  return result.filter.substring(8, result.filter.length - 1);
}

export function darkenColor(rgbArr: number[], strength = 0.4): number[] {
  return RGBLinearShade(rgbArr, -strength);
}

export function lightenColor(rgbArr: number[], strength = 0.4): number[] {
  return RGBLinearShade(rgbArr, strength);
}

export function rgbaToHex(rgba: string): string | undefined {
  if (!rgba) return undefined;
  if (isHexColor(rgba)) return rgba;

  const parts = rgba.substring(rgba.indexOf('(')).split(',');
  const r = parseInt(parts[0].substring(1).trim(), 10);
  const g = parseInt(parts[1].trim(), 10);
  const b = parseInt(parts[2].trim(), 10);

  // eslint-disable-next-line no-bitwise
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

// https://stackoverflow.com/a/12043228/5750490
export function isDark(hexColor: string): boolean {
  const c = hexColor.substring(1); // strip #
  const rgb = parseInt(c, 16); // convert rrggbb to decimal
  const r = (rgb >> 16) & 0xff; // extract red
  const g = (rgb >> 8) & 0xff; // extract green
  const b = (rgb >> 0) & 0xff; // extract blue

  const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b; // per ITU-R BT.709

  return luma < 128;
}
