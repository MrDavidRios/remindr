import { ThemeColors } from 'src/types/index.js';

export const LIGHT_THEME = (enableTransparency?: boolean): ThemeColors => {
  return {
    text: {
      primary: '#3c3c3c', // gray 700
      secondary: '#808080', // gray 500
    },
    surface: {
      primary: `rgb(250, 250, 250, ${enableTransparency ? '0.85' : '1.0'})`, // #FAFAFA (gray 100)
      primaryDark: `rgba(220, 220, 220, ${enableTransparency ? '0.90' : '1.0'})`, // #1A1A1A
      secondary: `rgb(230, 230, 230, ${enableTransparency ? '0.85' : '1.0'})`, // #E6E6E6 (gray 200)
      active: `rgb(213, 213, 213, ${enableTransparency ? '0.85' : '1.0'})`, // #D5D5D5 (gray 300)
    },
    imgFilter: 'invert(0.6)',
    svgFilter: 'invert(19%) sepia(0%) saturate(1793%) hue-rotate(159deg) brightness(93%) contrast(79%)',
    boxShadow: '0 2px 5px rgb(0 0 0 / 20%)',
  };
};

export const DARK_THEME = (enableTransparency?: boolean): ThemeColors => {
  return {
    text: {
      primary: 'white',
      secondary: '#b5b5b5', // gray 400
    },
    surface: {
      primary: `rgba(37, 37, 37, ${enableTransparency ? '0.90' : '1.0'})`, // #252525 (gray 900)
      primaryDark: `rgba(26, 26, 26, ${enableTransparency ? '0.90' : '1.0'})`, // #1A1A1A
      secondary: `rgba(50, 50, 50, ${enableTransparency ? '0.85' : '1.0'})`, // #323232 (gray 800)
      active: `rgba(60, 60, 60, ${enableTransparency ? '0.85' : '1.0'})`, // #3C3C3C (gray 700)
    },
    imgFilter: '',
    svgFilter: 'invert(89%) sepia(0%) saturate(133%) hue-rotate(193deg) brightness(86%) contrast(93%)',
    boxShadow: '0 2px 5px rgb(0 0 0 / 40%)',
  };
};
