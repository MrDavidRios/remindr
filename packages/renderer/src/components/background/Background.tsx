import { useEffect, useState } from 'react';
import { useAppSelector } from '/@/hooks';
import { updateBackground } from '/@/scripts/systems/stylemanager';
import type { BackgroundProps } from '/@/scripts/utils/backgroundprops';
import { getDefaultBackgroundProps, getStyleFromProps } from '/@/scripts/utils/backgroundprops';

export function Background() {
  const background = useAppSelector(state => state.settings.value.background);
  const stretchBackground = useAppSelector(state => state.settings.value.stretchBackground);

  const [backgroundProps, setBackgroundProps] = useState<BackgroundProps>(
    getDefaultBackgroundProps(),
  );

  useEffect(() => {
    updateBackground(background, stretchBackground, setBackgroundProps);
  }, [background]);

  useEffect(() => {
    const updateBackgroundImage = () =>
      updateBackground(background, stretchBackground, setBackgroundProps);

    const removeImageUpdateListener = window.electron.ipcRenderer.on(
      'background-image-update',
      updateBackgroundImage,
    );

    return () => {
      removeImageUpdateListener();
    };
  }, []);

  return (
    <div id="backgroundWrapper">
      <div
        id="background"
        style={getStyleFromProps(backgroundProps, background, stretchBackground)}
      />
      <BackgroundOverlay />
    </div>
  );
}

const BackgroundOverlay = () => {
  const backgroundOpacity = useAppSelector(state => state.settings.value.backgroundOpacity);

  return (
    <div
      id="backgroundOverlay"
      className="backdrop"
      style={{ opacity: backgroundOpacity }}
    />
  );
};
