import { Repeat } from '@remindr/shared';
import React from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { DropdownMenu } from '../../dropdown-menu/DropdownMenu';

interface RepeatIntervalsMenuProps {
  updateRepeatInterval: (interval: Repeat) => void;
  setShowRepeatIntervalsMenu: (show: boolean) => void;
}

export const RepeatIntervalsMenu: React.FC<RepeatIntervalsMenuProps> = ({
  updateRepeatInterval,
  setShowRepeatIntervalsMenu,
}) => {
  useHotkeys('esc', () => {
    setShowRepeatIntervalsMenu(false);
  });

  function handleRepeatIntervalClick(e: React.MouseEvent<HTMLLIElement, MouseEvent>, interval: Repeat) {
    // Make sure click events don't propogate to the dropdown open button
    e.stopPropagation();

    setShowRepeatIntervalsMenu(false);
    updateRepeatInterval(interval);
  }

  return (
    <DropdownMenu
      id="repeatIntervalsMenu"
      onClickOutside={() => setShowRepeatIntervalsMenu(false)}
      clickOutsideExceptions={['#repeatIntervalInputButton']}
      aria-label="Repeat Interval Menu"
    >
      <li onClick={(e) => handleRepeatIntervalClick(e, Repeat.Daily)}>Daily</li>
      <li onClick={(e) => handleRepeatIntervalClick(e, Repeat.Weekdays)}>Weekdays</li>
      <li onClick={(e) => handleRepeatIntervalClick(e, Repeat.Weekly)}>Weekly</li>
      <li onClick={(e) => handleRepeatIntervalClick(e, Repeat.Monthly)}>Monthly</li>
      <li onClick={(e) => handleRepeatIntervalClick(e, Repeat.Yearly)}>Yearly</li>
      <li onClick={(e) => handleRepeatIntervalClick(e, Repeat["Don't Repeat"])} style={{ color: '#bf5252' }}>
        Don&apos;t Repeat
      </li>
    </DropdownMenu>
  );
};
