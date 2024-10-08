import { useClickOutside } from '@hooks/useoutsideclick';
import { HotkeyScope } from '@renderer-types/hotkeyScope';
import { useRef, useState } from 'react';
import { useHotkeysContext } from 'react-hotkeys-hook';
import { DropdownOptions } from './DropdownOptions';

export interface DropdownProps<T> {
  name: string;
  options: T[];
  optionLabels: string[];
  selectedIdx?: number;
  onSelect: (idx: number) => void;
  scrollParentId?: string;
}

export function Dropdown<T>(props: DropdownProps<T>) {
  const { name, options, optionLabels, selectedIdx: initialSelectedIdx = 0, onSelect, scrollParentId } = props;

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

  const dropdownMenuRef = useClickOutside(() => closeDropdown(), [], true);

  const dropdownMenuButtonHeight = dropdownMenuRef.current?.clientHeight ?? 0;
  const scrollParentElement =
    scrollParentId !== undefined ? document.getElementById(scrollParentId) : dropdownMenuRef.current?.parentElement;
  const parentScrollTop = scrollParentElement?.scrollTop ?? 0;
  const offsetTop = dropdownMenuRef.current?.offsetTop ?? 0;
  const yAnchor = dropdownMenuButtonHeight + offsetTop - parentScrollTop;

  return (
    <button
      className={`select-box ${isOpen ? ' active' : ''}`}
      ref={dropdownMenuRef as unknown as React.RefObject<HTMLButtonElement>}
      onClick={toggleOpen}
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
          topAnchorY={yAnchor}
          onSelect={(idx) => {
            setSelectedIdx(idx);
            onSelect(idx);
          }}
          closeDropdown={() => {
            closeDropdown();
            dropdownMenuRef.current?.focus();
          }}
        />
      )}
      <div className="selected-option dropdown" style={{ width: '100%' }}>
        {optionLabels[selectedIdx]}
      </div>
    </button>
  );
}
