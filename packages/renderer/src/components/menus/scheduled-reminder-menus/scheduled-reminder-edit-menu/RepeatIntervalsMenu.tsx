import { Menu, Repeat } from "@remindr/shared";
import { closeDropdown } from "@renderer/features/menu-state/menuSlice";
import { useAppDispatch } from "@renderer/hooks";
import React from "react";
import { DropdownMenu } from "../../dropdown-menu/DropdownMenu";

interface RepeatIntervalsMenuProps {
  updateRepeatInterval: (interval: Repeat) => void;
  setShowRepeatIntervalsMenu: (show: boolean) => void;
}

export const RepeatIntervalsMenu: React.FC<RepeatIntervalsMenuProps> = ({
  updateRepeatInterval,
  setShowRepeatIntervalsMenu,
}) => {
  const dispatch = useAppDispatch();

  function handleRepeatIntervalClick(
    e: React.MouseEvent<HTMLLIElement, MouseEvent>,
    interval: Repeat
  ) {
    // Make sure click events don't propogate to the dropdown open button
    e.stopPropagation();

    dispatch(
      closeDropdown({
        menu: Menu.ScheduledReminderEditMenu,
        dropdownName: "repeatIntervalsMenu",
      })
    );

    setShowRepeatIntervalsMenu(false);
    updateRepeatInterval(interval);
  }

  return (
    <DropdownMenu
      parentMenu={Menu.ScheduledReminderEditMenu}
      id="repeatIntervalsMenu"
      onClose={() => setShowRepeatIntervalsMenu(false)}
      clickOutsideExceptions={["#repeatIntervalInputButton"]}
      aria-label="Repeat Interval Menu"
    >
      <li onClick={(e) => handleRepeatIntervalClick(e, Repeat.Daily)}>Daily</li>
      <li onClick={(e) => handleRepeatIntervalClick(e, Repeat.Weekdays)}>
        Weekdays
      </li>
      <li onClick={(e) => handleRepeatIntervalClick(e, Repeat.Weekly)}>
        Weekly
      </li>
      <li onClick={(e) => handleRepeatIntervalClick(e, Repeat.Monthly)}>
        Monthly
      </li>
      <li onClick={(e) => handleRepeatIntervalClick(e, Repeat.Yearly)}>
        Yearly
      </li>
      <li
        onClick={(e) => handleRepeatIntervalClick(e, Repeat.NoRepeat)}
        style={{ color: "#bf5252" }}
      >
        Don&apos;t Repeat
      </li>
    </DropdownMenu>
  );
};
