import { dynamicMenuHeightAnimationProps } from '@renderer/animation';
import { useAnimationsEnabled } from '@renderer/scripts/utils/hooks/useanimationsenabled';
import { motion, useMotionValue, useMotionValueEvent } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { ArrowNavigable } from '../accessibility/ArrowNavigable';
import type { DropdownProps } from './Dropdown';

interface DropdownOptionsProps<T> extends DropdownProps<T> {
  setWidestWidth: (width: number) => void;
  closeDropdown: () => void;
}

export function DropdownOptions<T>(props: DropdownOptionsProps<T>) {
  const { name, options, optionLabels, onSelect, setWidestWidth, closeDropdown } = props;
  const optionRefs = options.map(() => useRef(null));
  const animationsEnabled = useAnimationsEnabled();

  useEffect(() => {
    let maxWidth = 0;
    optionRefs.forEach((ref) => {
      if (ref.current && (ref.current as HTMLElement).offsetWidth > maxWidth) {
        maxWidth = (ref.current as HTMLElement).offsetWidth;
      }
    });
    setWidestWidth(maxWidth);
  }, [options]);

  const [hideOverflow, setHideOverflow] = useState(true);

  const height = useMotionValue(0);
  useMotionValueEvent(height, 'animationCancel', () => setHideOverflow(true));
  useMotionValueEvent(height, 'animationStart', () => setHideOverflow(true));
  useMotionValueEvent(height, 'animationComplete', () => {
    // top border of dropdown options is ~2px tall - this accounts for that height
    if (height.get() < 4) return;

    setHideOverflow(false);
  });

  return (
    <motion.ul
      className="options-container frosted"
      style={{ overflow: hideOverflow ? 'hidden' : 'visible', height }}
      role="listbox"
      id={`${name}Listbox`}
      {...dynamicMenuHeightAnimationProps(animationsEnabled)}
    >
      <ArrowNavigable autoFocus>
        {options.map((_option, idx) => {
          const bottomOption = idx === options.length - 1;

          return (
            <div
              key={idx}
              ref={optionRefs[idx]}
              style={{ width: '100%' }}
              className={`option ${bottomOption && 'bottom-option'}`}
              onClick={(e) => {
                e.stopPropagation();

                onSelect(idx);
                closeDropdown();
              }}
            >
              <input type="radio" className="radio" />
              <label>{optionLabels[idx]}</label>
            </div>
          );
        })}
      </ArrowNavigable>
    </motion.ul>
  );
}
