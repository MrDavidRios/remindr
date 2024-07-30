import { backgroundImageExists } from './imgutils';

export interface BackgroundProps {
  background?: string;
  backgroundSize?: string;
  backgroundPosition?: string;
  backgroundRepeat?: string;
  backgroundAttachment?: string;
}

export function getDefaultBackgroundProps() {
  return {
    background: '#121212',
    backgroundSize: 'auto',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundAttachment: 'fixed',
  };
}

export function getStyleFromProps(props: BackgroundProps, background: string, stretchBackground: boolean) {
  if (background !== 'image') return { backgroundColor: props.background };

  // Image
  return {
    backgroundImage: props.background,
    backgroundSize: stretchBackground ? 'cover' : 'auto',
    backgroundPosition: props.backgroundPosition,
    backgroundRepeat: stretchBackground ? 'no-repeat' : 'repeat',
    backgroundAttachment: props.backgroundAttachment,
  };
}

/**
 * Returns whether the app should display an image or a solid color background depending on the setting and whether the image exists.
 * @param backgroundSetting
 * @returns
 */
export function isBackgroundAnImage(backgroundSetting: string) {
  const validBackgroundImage = backgroundImageExists();
  return backgroundSetting === 'image' && validBackgroundImage;
}
