import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useAnimationsEnabled } from 'renderer/scripts/utils/hooks/useanimationsenabled';
import useClickOutside from 'renderer/scripts/utils/hooks/useoutsideclick';
import { DropdownOptions } from './DropdownOptions';

export interface DropdownProps<T> {
  name: string;
  options: T[];
  optionLabels: string[];
  selectedIdx?: number;
  onSelect: (idx: number) => void;
}

export function Dropdown<T>(props: DropdownProps<T>) {
  const { name, options, optionLabels, selectedIdx: initialSelectedIdx = 0, onSelect } = props;

  const animationsEnabled = useAnimationsEnabled();
  const [widestWidth, setWidestWidth] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState(initialSelectedIdx);

  const [isOpen, setIsOpen] = useState(false);
  const toggleOpen = () => setIsOpen(!isOpen);

  const dropdownMenuRef = useClickOutside(() => setIsOpen(false));

  useHotkeys('esc', () => setIsOpen(false));

  const dropdownWidthAnimationProps = animationsEnabled
    ? {
        animate: { width: widestWidth === 0 ? 'min-content' : widestWidth },
      }
    : {
        style: { width: widestWidth === 0 ? 'min-content' : widestWidth },
      };

  return (
    <motion.button
      className={`select-box ${isOpen ? ' active' : ''}`}
      ref={dropdownMenuRef as any}
      onClick={toggleOpen}
      {...dropdownWidthAnimationProps}
      layout={animationsEnabled ? 'size' : false}
      onKeyDown={(e) => {
        if (e.key === 'Tab') setIsOpen(false);
      }}
      type="button"
      aria-controls={`${name}Listbox`}
      aria-haspopup="listbox"
      role="combobox"
      aria-expanded={isOpen}
    >
      <AnimatePresence>
        {isOpen && (
          <DropdownOptions
            name={name}
            options={options}
            optionLabels={optionLabels}
            onSelect={(idx) => {
              setSelectedIdx(idx);
              onSelect(idx);
            }}
            setWidestWidth={setWidestWidth}
            closeDropdown={() => {
              setIsOpen(false);
              dropdownMenuRef.current?.focus();
            }}
          />
        )}
      </AnimatePresence>
      <div className="selected-option dropdown" style={{ width: '100%' }}>
        {optionLabels[selectedIdx]}
      </div>
    </motion.button>
  );
}
