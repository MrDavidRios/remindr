import calendarTimeframeIcon from '@assets/icons/calendar-timeframe.svg';
import { Menu } from '@remindr/shared';
import { toggleMenu } from '@renderer/features/menu-state/menuSlice';
import { useAppDispatch } from '@renderer/hooks';
import type { FC } from 'react';

export const TimeframeMenuButton: FC = () => {
  const dispatch = useAppDispatch();

  return (
    <button
      type="button"
      id="timeframeMenuButton"
      className="toolbar-button"
      title="Choose Timeframe"
      onClick={() => dispatch(toggleMenu(Menu.TimeframeMenu))}
      aria-label="Choose Timeframe"
    >
      <div className="toolbar-button-img-container">
        <img src={calendarTimeframeIcon} className="small" draggable="false" alt="" />
      </div>
    </button>
  );
};
