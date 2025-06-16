import { FrequencyType, Menu, RepeatInfo } from "@remindr/shared";
import { closeDropdown } from "@renderer/features/menu-state/menuSlice";
import { useAppDispatch } from "@renderer/hooks";
import React from "react";
import { DropdownMenu } from "../../dropdown-menu/DropdownMenu";

interface RepeatIntervalsMenuProps {
  updateRepeatInfo: (repeatInfo: RepeatInfo) => void;
  setShowRepeatIntervalsMenu: (show: boolean) => void;
}

export const RepeatIntervalsMenu: React.FC<RepeatIntervalsMenuProps> = ({
  updateRepeatInfo: updateRepeatInterval,
  setShowRepeatIntervalsMenu,
}) => {
  const dispatch = useAppDispatch();

  function handleRepeatChoiceClick(
    e: React.MouseEvent<HTMLLIElement, MouseEvent>,
    intervalType: FrequencyType | "custom"
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

    if (intervalType === "custom") {
      throw new Error("Custom repeat editor not yet implemented.");
    }

    const repeatInfo = new RepeatInfo({
      frequencyType: intervalType,
      frequency: 1, // Default to 1 for all intervals
    });

    if (intervalType === FrequencyType.Weekdays) {
      repeatInfo.frequency = [true, true, true, true, true, false, false];
    }

    updateRepeatInterval(repeatInfo);
  }

  return (
    <DropdownMenu
      parentMenu={Menu.ScheduledReminderEditMenu}
      id="repeatIntervalsMenu"
      onClose={() => setShowRepeatIntervalsMenu(false)}
      clickOutsideExceptions={["#repeatIntervalInputButton"]}
      aria-label="Repeat Interval Menu"
    >
      <li
        onClick={(e) =>
          handleRepeatChoiceClick(e, FrequencyType.FixedIntervalDays)
        }
      >
        Daily
      </li>
      <li onClick={(e) => handleRepeatChoiceClick(e, FrequencyType.Weekdays)}>
        Weekdays
      </li>
      <li
        onClick={(e) =>
          handleRepeatChoiceClick(e, FrequencyType.FixedIntervalWeeks)
        }
      >
        Weekly
      </li>
      <li
        onClick={(e) =>
          handleRepeatChoiceClick(e, FrequencyType.FixedIntervalMonths)
        }
      >
        Monthly
      </li>
      <li
        className="menu-top-border"
        onClick={(e) => handleRepeatChoiceClick(e, "custom")}
      >
        Custom
      </li>
      <li
        className="menu-top-border"
        onClick={(e) => handleRepeatChoiceClick(e, FrequencyType.Never)}
        style={{ color: "#bf5252" }}
      >
        Don&apos;t Repeat
      </li>
    </DropdownMenu>
  );
};
