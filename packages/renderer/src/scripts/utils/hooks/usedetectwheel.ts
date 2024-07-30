import { useEffect } from 'react';

// Thanks for the inspo: https://github.com/SMAKSS/react-scroll-direction/blob/master/src/index.ts
type DetectWheelProps = {
  element?: HTMLElement;
  callback?: () => void;
};

export function useDetectWheel(props: DetectWheelProps = {}) {
  const { element = document.documentElement, callback = () => {} } = props;

  useEffect(() => {
    /** Function to handle onWheel event */
    const onWheel = () => {
      callback?.();
    };

    element.addEventListener('wheel', onWheel);

    return () => element.removeEventListener('wheel', onWheel);
  }, []);
}
