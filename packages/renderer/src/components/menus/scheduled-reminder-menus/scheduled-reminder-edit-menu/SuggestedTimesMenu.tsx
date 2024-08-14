import { addMinutes } from '@remindr/shared';
import React from 'react';
import { DropdownMenu } from '../../dropdown-menu/DropdownMenu';

interface SuggestedTimesMenuProps {
  setShowSuggestedTimesMenu: (show: boolean) => void;
  updateSuggestedTime: (date: Date) => void;
}

export const SuggestedTimesMenu: React.FC<SuggestedTimesMenuProps> = ({
  updateSuggestedTime,
  setShowSuggestedTimesMenu,
}) => {
  function handleSuggestedTimeClick(e: React.MouseEvent<HTMLLIElement, MouseEvent>, minuteAmount: number) {
    // Make sure click events don't propogate to the dropdown open button
    e.stopPropagation();

    setShowSuggestedTimesMenu(false);
    const updatedDate = addMinutes(new Date(), minuteAmount);
    updateSuggestedTime(updatedDate);
  }

  return (
    <DropdownMenu
      id="suggestedTimesMenu"
      onClose={() => setShowSuggestedTimesMenu(false)}
      clickOutsideExceptions={['#suggestedTimesInputButton']}
    >
      <li onClick={(e) => handleSuggestedTimeClick(e, 15)} title="Set reminder 15 minutes from now">
        15 Minutes
      </li>
      <li onClick={(e) => handleSuggestedTimeClick(e, 30)} title="Set reminder 30 minutes from now">
        30 Minutes
      </li>
      <li onClick={(e) => handleSuggestedTimeClick(e, 60)} title="Set reminder 1 hour from now">
        1 Hour
      </li>
      <li onClick={(e) => handleSuggestedTimeClick(e, 180)} title="Set reminder 3 hours from now">
        3 Hours
      </li>
      <li onClick={(e) => handleSuggestedTimeClick(e, 720)} title="Set reminder 12 hours from now">
        12 Hours
      </li>
    </DropdownMenu>
  );
};
