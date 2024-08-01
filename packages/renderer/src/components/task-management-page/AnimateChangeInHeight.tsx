import { motion, useMotionValue, useMotionValueEvent } from 'framer-motion';
import { FC, ReactNode, useEffect, useRef, useState } from 'react';
import { useAnimationsEnabled } from '/@/scripts/utils/hooks/useanimationsenabled';

interface AnimateChangeInHeightProps {
  show: boolean;
  children: ReactNode;
  className?: string;
}

export const AnimateChangeInHeight: FC<AnimateChangeInHeightProps> = ({ show, children, className }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [goalHeight, setGoalHeight] = useState<number | 'auto'>('auto');
  const animationComplete = useRef<boolean>(false);

  const height = useMotionValue('auto');
  useMotionValueEvent(height, 'animationCancel', () => {
    animationComplete.current = false;
  });
  useMotionValueEvent(height, 'animationStart', () => {
    animationComplete.current = false;
  });
  useMotionValueEvent(height, 'animationComplete', () => {
    if ((height.get() as unknown as string) === '0px') return;

    animationComplete.current = true;
  });

  const animationsEnabled = useAnimationsEnabled();

  useEffect(() => setGoalHeight(show ? 'auto' : 0), [show, animationsEnabled]);

  useEffect(() => {
    if (!containerRef.current) return () => {};

    const resizeObserver = new ResizeObserver((entries) => {
      // We only have one entry, so we can use entries[0].
      const observedHeight = entries[0].contentRect.height;

      // Don't change the goal height if it's currently being animated
      if (animationComplete.current) setGoalHeight(observedHeight);
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      // Cleanup the observer when the component is unmounted
      resizeObserver.disconnect();
    };
  }, []);

  return animationsEnabled ? (
    <motion.div className={className} style={{ height }} animate={{ height: goalHeight }}>
      <div ref={containerRef}>{children}</div>
    </motion.div>
  ) : (
    <div className={className}>{children}</div>
  );
};
