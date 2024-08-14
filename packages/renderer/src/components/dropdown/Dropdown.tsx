import { useAnimationsEnabled } from '@hooks/useanimationsenabled';
import { useClickOutside } from '@hooks/useoutsideclick';
import { HotkeyScope } from '@renderer-types/hotkeyScope';
import { motion } from 'framer-motion';
import { useRef, useState } from 'react';
import { useHotkeysContext } from 'react-hotkeys-hook';
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
  const toggleOpen = () => (isOpen ? closeDropdown() : openDropdown());
  const { enableScope, disableScope, enabledScopes } = useHotkeysContext();

  const previouslyEnabledScopes = useRef<string[]>(enabledScopes);

  const openDropdown = () => {
    setIsOpen(true);

    previouslyEnabledScopes.current = enabledScopes;

    for (const scope of previouslyEnabledScopes.current) {
      disableScope(scope);
    }

    enableScope(HotkeyScope.Dropdown);
  };

  const closeDropdown = () => {
    setIsOpen(false);

    for (const scope of previouslyEnabledScopes.current) {
      enableScope(scope);
    }

    disableScope(HotkeyScope.Dropdown);
  };

  const dropdownMenuRef = useClickOutside(() => closeDropdown());

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
      ref={dropdownMenuRef as unknown as React.RefObject<HTMLButtonElement>}
      onClick={toggleOpen}
      {...dropdownWidthAnimationProps}
      layout={animationsEnabled ? 'size' : false}
      onKeyDown={(e) => {
        if (e.key === 'Tab') closeDropdown();
      }}
      type="button"
      aria-controls={`${name}Listbox`}
      aria-haspopup="listbox"
      role="combobox"
      aria-expanded={isOpen}
    >
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
            closeDropdown();
            dropdownMenuRef.current?.focus();
          }}
        />
      )}
      <div className="selected-option dropdown" style={{ width: '100%' }}>
        {optionLabels[selectedIdx]}
      </div>
    </motion.button>
  );
}
