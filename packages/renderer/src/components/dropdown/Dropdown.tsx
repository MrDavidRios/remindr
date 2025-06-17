import { useClickOutside } from "@hooks/useoutsideclick";
import { Menu } from "@remindr/shared";
import {
  closeDropdown,
  openDropdown,
} from "@renderer/features/menu-state/menuSlice";
import { useAppDispatch } from "@renderer/hooks";
import { useState } from "react";
import { DropdownOptions } from "./DropdownOptions";

export interface DropdownProps<T> {
  parentMenu: Menu;
  name: string;
  options: T[];
  optionLabels: string[];
  selectedIdx?: number;
  onSelect: (idx: number) => void;
  disabled?: boolean;
  scrollParentId?: string;
}

export function Dropdown<T>(props: DropdownProps<T>) {
  const dispatch = useAppDispatch();

  const {
    parentMenu,
    name,
    options,
    optionLabels,
    selectedIdx: initialSelectedIdx = 0,
    onSelect,
    disabled = false,
    scrollParentId,
  } = props;

  const [selectedIdx, setSelectedIdx] = useState(initialSelectedIdx);

  const [isOpen, setIsOpen] = useState(false);
  const toggleOpen = () => (isOpen ? onCloseDropdown() : onOpenDropdown());

  const onOpenDropdown = () => {
    dispatch(openDropdown({ menu: parentMenu, dropdownName: name }));

    setIsOpen(true);
  };
  const onCloseDropdown = () => {
    dispatch(closeDropdown({ menu: parentMenu, dropdownName: name }));

    setIsOpen(false);
  };

  const dropdownMenuRef = useClickOutside(() => onCloseDropdown(), [], true);

  const dropdownMenuButtonHeight = dropdownMenuRef.current?.clientHeight ?? 0;
  const scrollParentElement =
    scrollParentId !== undefined
      ? document.getElementById(scrollParentId)
      : dropdownMenuRef.current?.parentElement;
  const parentScrollTop = scrollParentElement?.scrollTop ?? 0;
  const offsetTop = dropdownMenuRef.current?.offsetTop ?? 0;
  const yAnchor = dropdownMenuButtonHeight + offsetTop - parentScrollTop;

  return (
    <button
      className={`select-box ${isOpen ? " active" : ""}`}
      ref={dropdownMenuRef as unknown as React.RefObject<HTMLButtonElement>}
      onClick={toggleOpen}
      onKeyDown={(e) => {
        if (e.key === "Tab") onCloseDropdown();
      }}
      type="button"
      aria-controls={`${name}Listbox`}
      aria-haspopup="listbox"
      role="combobox"
      disabled={disabled}
      aria-expanded={isOpen}
    >
      {isOpen && (
        <DropdownOptions
          parentMenu={parentMenu}
          name={name}
          options={options}
          optionLabels={optionLabels}
          topAnchorY={yAnchor}
          onSelect={(idx) => {
            setSelectedIdx(idx);
            onSelect(idx);
          }}
          closeDropdown={() => {
            onCloseDropdown();
            dropdownMenuRef.current?.focus();
          }}
        />
      )}
      <div className="selected-option dropdown" style={{ width: "100%" }}>
        {optionLabels[selectedIdx]}
      </div>
    </button>
  );
}
