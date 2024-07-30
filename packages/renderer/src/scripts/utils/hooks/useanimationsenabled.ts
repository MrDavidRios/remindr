import { useAppStore } from 'renderer/hooks';

/**
 * Returns whether or not animations are enabled (from user state). This does not trigger a re-render on animation
 * setting change like useAppSelector would.
 */
export const useAnimationsEnabled = () => {
  const store = useAppStore();
  return store.getState().settings.value.enableAnimations ?? false;
};
