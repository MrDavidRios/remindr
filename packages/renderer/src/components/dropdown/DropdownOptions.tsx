import { HotkeyScope } from '@renderer-types/hotkeyScope';
import { dynamicMenuHeightAnimationProps } from '@renderer/animation';
import { useAnimationsEnabled } from '@renderer/scripts/utils/hooks/useanimationsenabled';
import { useRef } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { RemoveScroll } from 'react-remove-scroll';
import { ArrowNavigable } from '../accessibility/ArrowNavigable';
import type { DropdownProps } from './Dropdown';

interface DropdownOptionsProps<T> extends DropdownProps<T> {
  topAnchorY: number;
  closeDropdown: () => void;
}

export function DropdownOptions<T>(props: DropdownOptionsProps<T>) {
  const { name, options, optionLabels, topAnchorY, onSelect, closeDropdown } = props;
  const optionRefs = options.map(() => useRef(null));
  const animationsEnabled = useAnimationsEnabled();

  useHotkeys('esc', () => closeDropdown(), { scopes: [HotkeyScope.Dropdown] });

  return (
    <RemoveScroll>
      <ul
        className="options-container frosted"
        style={{ top: topAnchorY }}
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
      </ul>
    </RemoveScroll>
  );
}
