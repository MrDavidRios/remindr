// #region Variable Initialization
// eslint-disable-next-line @typescript-eslint/no-var-requires

import { DARK_THEME, LIGHT_THEME, Settings, Theme } from '@remindr/shared';
import { getThemeColors } from '@remindr/shared/src';
import store from '@renderer/app/store';
import { FastAverageColorResult } from 'fast-average-color';
import { Dispatch, SetStateAction } from 'react';
import { BackgroundProps, getDefaultBackgroundProps, isBackgroundAnImage } from '../utils/backgroundprops';
import {
  darkenColor,
  getColorFilter,
  isDark,
  lightenColor,
  rgbArrToString,
  rgbStringToArr,
  rgbaToHex,
} from '../utils/colorutils';
import { getDominantColor, getImgUrlFromData } from '../utils/imgutils';

const root = document.documentElement;

function updateStyleVarsInMain() {
  const propertiesToUpdate = [
    '--ui-accent-color-filter',
    '--svg-filter',
    '--text-color-primary',
    '--text-color-secondary',
    '--surface-primary',
    '--surface-secondary',
    '--surface-active',
  ];

  const styleValues: Record<string, string> = {};
  const styleData = getComputedStyle(document.documentElement);

  propertiesToUpdate.forEach((property) => {
    styleValues[property] = styleData.getPropertyValue(property);
  });

  window.electron.ipcRenderer.sendMessage('update-notification-style-values', JSON.stringify(styleValues));
}

export function applyTheme(): void {
  const settings = store.getState().settings.value;

  const currentTheme = getCurrentTheme(settings.theme);
  const themeColors = getThemeColors(currentTheme, settings.enableTransparency);

  root.style.setProperty('--surface-primary', themeColors.surface.primary);
  root.style.setProperty('--surface-primary-dark', themeColors.surface.primaryDark);
  root.style.setProperty('--surface-secondary', themeColors.surface.secondary);
  root.style.setProperty('--surface-active', themeColors.surface.active);
  root.style.setProperty('--subtle-box-shadow', themeColors.boxShadow);
  root.style.setProperty('--svg-filter', themeColors.svgFilter);
  root.style.setProperty('--img-filter', themeColors.imgFilter);
  root.style.setProperty('--text-color-primary', themeColors.text.primary);
  root.style.setProperty('--text-color-secondary', themeColors.text.secondary);

  // Theme-specific logic
  if (currentTheme === Theme.Dark) {
    document.querySelectorAll('#window-controls .icon').forEach((el) => {
      el.classList.remove('invert');
    });

    document.querySelector('#hamburger-button img')?.setAttribute('style', 'filter: invert(0.9)');
  } else {
    document.querySelectorAll('#window-controls .icon').forEach((el) => {
      el.classList.add('invert');
    });

    document.querySelector('#hamburger-button img')?.setAttribute('style', 'filter: invert(0.4)');
  }

  updateStyleVarsInMain();
}

window.electron.ipcRenderer.on('system-theme-changed', () => {
  applyTheme();
});

function getCurrentTheme(themeSetting: Theme): Theme {
  return themeSetting === Theme.System ? window.electron.theme.getSystemTheme() : themeSetting;
}

async function updateTitlebarStyles(): Promise<void> {
  const titlebar = document.getElementById('titlebar');

  if (!titlebar) throw new Error('updateTitlebarStyles: titlebar element is undefined');

  const { background } = store.getState().settings.value;
  if (await isBackgroundAnImage(background)) {
    // Remove a shadow from the titlebar if there is an image as the background.
    titlebar.style.boxShadow = 'none';
  } else {
    // Add a shadow to the titlebar if there is a plain color is the background.
    titlebar.style.boxShadow = '0px 10px 16px -10px rgba(0, 0, 0, 0.1)';
  }
}

// Load styles and apply them here.
export async function setLoadedStyles(settings: Settings): Promise<void> {
  applyTheme();
  updateTitlebarStyles();

  if (await isBackgroundAnImage(settings.background)) {
    const imgUrl = getImgUrlFromData(await window.data.getBackgroundImage());

    const dominantColor = await getDominantColor(imgUrl);
    setAccentColors(dominantColor);
  }

  setOverlayColors();

  updateStyleVarsInMain();
}

// Helper function for React
async function getBackground(background: string, stretchBackground: boolean): Promise<BackgroundProps> {
  const backgroundProps = getDefaultBackgroundProps();

  applyTheme();
  updateTitlebarStyles();

  // If the background image is non-existent, set the background to a solid color.
  const backgroundImageIsInvalid = background === 'image' && (await isBackgroundAnImage(background));
  if (!backgroundImageIsInvalid) backgroundProps.background = background;
  else backgroundProps.background = '#121212';

  if ((await isBackgroundAnImage(background)) && stretchBackground) {
    backgroundProps.backgroundSize = 'cover';
    backgroundProps.backgroundRepeat = 'no-repeat';
    backgroundProps.backgroundPosition = 'center';
    backgroundProps.backgroundAttachment = 'fixed';
  }

  return backgroundProps;
}
// #endregion

function setAccentColors(color: FastAverageColorResult) {
  const rgbArr = rgbStringToArr(color.rgb);

  let accentColorRGB = rgbArr;
  let darkAccentColorRGB = darkenColor(rgbArr);
  if (color.isDark) {
    accentColorRGB = lightenColor(rgbArr, 0.2);
    darkAccentColorRGB = rgbArr;
  }

  // Accent color hex & filter
  root.style.setProperty('--ui-accent-color', rgbArrToString(accentColorRGB));
  const accentColorFilter = getColorFilter(accentColorRGB);
  root.style.setProperty('--ui-accent-color-filter', accentColorFilter);

  // Dark accent color hex & filter
  root.style.setProperty('--ui-accent-color-dark', rgbArrToString(darkAccentColorRGB));

  const darkAccentColorFilter = getColorFilter(darkAccentColorRGB);
  root.style.setProperty('--ui-accent-color-dark-filter', darkAccentColorFilter);
}

/**
 * Sets the color of the text/svg accent overlay colors. Based off of the current accent color.
 * @returns
 */
function setOverlayColors() {
  const color = getAccentColor();
  if (!color) return;

  const isColorDark = isDark(color);

  // Color for text to be rendered over accent color
  const transparencyEnabled = store.getState().settings.value.enableTransparency;
  const invertedTextColor = isColorDark
    ? DARK_THEME(transparencyEnabled).text.primary
    : LIGHT_THEME(transparencyEnabled).text.primary;
  const invertedSvgFilter = isColorDark
    ? DARK_THEME(transparencyEnabled).svgFilter
    : LIGHT_THEME(transparencyEnabled).svgFilter;

  root.style.setProperty('--text-color-over-accent', invertedTextColor);
  root.style.setProperty('--svg-filter-over-accent', invertedSvgFilter);
}

/**
 * Returns the accent color in hex.
 */
export function getAccentColor(): string | undefined {
  const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--ui-accent-color')?.trim();
  return rgbaToHex(accentColor);
}

// Hooks
export const updateBackground = async (
  background: string,
  stretchBackground: boolean,
  setBackgroundProps: Dispatch<SetStateAction<BackgroundProps>>,
) => {
  const backgroundProps: BackgroundProps = await getBackground(background, stretchBackground);
  if (!(await isBackgroundAnImage(background))) {
    setBackgroundProps(backgroundProps);
    return;
  }

  // If background is set to image, set other properties (accent color, titlebar, etc. until these things are reactive)
  const imgUrl = getImgUrlFromData(await window.data.getBackgroundImage());
  backgroundProps.background = `url(${imgUrl})`;

  setBackgroundProps(backgroundProps);

  const dominantColor = await getDominantColor(imgUrl);
  setAccentColors(dominantColor);
  setOverlayColors();

  updateStyleVarsInMain();
};
