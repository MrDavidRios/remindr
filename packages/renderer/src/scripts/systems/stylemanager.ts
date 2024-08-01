// #region Variable Initialization
// eslint-disable-next-line @typescript-eslint/no-var-requires

import { Settings, Theme } from '@remindr/shared';
import { FastAverageColorResult } from 'fast-average-color';
import { Dispatch, SetStateAction } from 'react';
import { BackgroundProps, getDefaultBackgroundProps, isBackgroundAnImage } from '../utils/backgroundprops';
import {
  darkenColor,
  getColorFilter,
  lightenColor,
  rgbArrToString,
  rgbStringToArr,
  rgbaToHex,
} from '../utils/colorutils';
import { getDominantColor, getImgUrlFromData } from '../utils/imgutils';
import store from '/@/app/store';

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
  switch (currentTheme) {
    case Theme.Dark:
      // #252525 (gray 900)
      root.style.setProperty('--surface-primary', `rgba(37, 37, 37, ${settings.enableTransparency ? '0.90' : '1.0'})`);
      // #323232 (gray 800)
      root.style.setProperty(
        '--surface-secondary',
        `rgba(50, 50, 50, ${settings.enableTransparency ? '0.85' : '1.0'})`,
      );
      // #3C3C3C (gray 700)
      root.style.setProperty('--surface-active', `rgba(60, 60, 60, ${settings.enableTransparency ? '0.85' : '1.0'})`);
      root.style.setProperty('--subtle-box-shadow', '0 2px 5px rgb(0 0 0 / 40%)');
      root.style.setProperty(
        '--svg-filter',
        'invert(89%) sepia(0%) saturate(133%) hue-rotate(193deg) brightness(86%) contrast(93%)',
      );
      root.style.setProperty('--img-filter', '');
      root.style.setProperty('--text-color-primary', 'white');
      // gray 400
      root.style.setProperty('--text-color-secondary', '#b5b5b5');

      document.querySelectorAll('#window-controls .icon').forEach((el) => {
        el.classList.remove('invert');
      });

      document.querySelector('#hamburger-button img')?.setAttribute('style', 'filter: invert(0.9)');
      break;
    case Theme.Light:
      // #FAFAFA (gray 100)
      root.style.setProperty(
        '--surface-primary',
        `rgb(250, 250, 250, ${settings.enableTransparency ? '0.85' : '1.0'})`,
      );
      // #E6E6E6 (gray 200)
      root.style.setProperty(
        '--surface-secondary',
        `rgb(230, 230, 230, ${settings.enableTransparency ? '0.85' : '1.0'})`,
      );
      // #D5D5D5 (gray 300)
      root.style.setProperty('--surface-active', `rgb(213, 213, 213, ${settings.enableTransparency ? '0.85' : '1.0'})`);
      root.style.setProperty('--subtle-box-shadow', '0 2px 5px rgb(0 0 0 / 20%)');
      root.style.setProperty(
        '--svg-filter',
        'invert(19%) sepia(0%) saturate(1793%) hue-rotate(159deg) brightness(93%) contrast(79%)',
      );
      // gray 700
      root.style.setProperty('--text-color-primary', '#3c3c3c');
      root.style.setProperty('--img-filter', 'invert(0.6)');
      // gray 500
      root.style.setProperty('--text-color-secondary', '#808080');
      document.querySelectorAll('#window-controls .icon').forEach((el) => {
        el.classList.add('invert');
      });

      document.querySelector('#hamburger-button img')?.setAttribute('style', 'filter: invert(0.4)');
      break;
    default:
      throw new Error(`Invalid theme: ${currentTheme}`);
  }

  updateStyleVarsInMain();
}

window.electron.ipcRenderer.on('system-theme-changed', () => {
  applyTheme();
});

function getCurrentTheme(themeSetting: Theme): string {
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

  updateStyleVarsInMain();
};
