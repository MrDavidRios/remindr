export const backdropAnimationProps = (animationsEnabled: boolean) => {
  return animationsEnabled
    ? {
        animate: { opacity: 0.5 },
        initial: { opacity: 0 },
        exit: { opacity: 0 },
      }
    : {
        style: { opacity: 0.5 },
      };
};

const popupMenuTransition = { ease: 'easeOut', duration: 0.2 };
const popupMenuAnimationProps = {
  layout: true,
  transition: { popupMenuTransition },
};

export const menuHeightAnimationProps = (animationsEnabled: boolean) => {
  if (!animationsEnabled) return {};

  return {
    ...popupMenuAnimationProps,
    layout: true,
    initial: { height: '0px' },
    exit: { height: '0px' },
  };
};

export const dynamicMenuHeightAnimationProps = (animationsEnabled: boolean) => {
  if (!animationsEnabled) return { style: { height: 'max-content' } };

  return {
    animate: { height: 'max-content' },
    initial: { height: 0 },
    exit: { height: 0 },
  };
};

export const menuWidthAnimationProps = (animationsEnabled: boolean) => {
  if (!animationsEnabled) return {};

  return {
    ...popupMenuAnimationProps,
    layout: true,
    initial: { width: '0px' },
    exit: { width: '0px' },
  };
};

export const collapseButtonAnimationProps = (animationsEnabled: boolean, collapsed: boolean) => {
  if (!animationsEnabled)
    return {
      style: { rotate: collapsed ? 0 : 90 },
    };

  return {
    initial: { rotate: collapsed ? 0 : 90 },
    animate: { rotate: collapsed ? 0 : 90 },
    transition: { popupMenuTransition },
  };
};
