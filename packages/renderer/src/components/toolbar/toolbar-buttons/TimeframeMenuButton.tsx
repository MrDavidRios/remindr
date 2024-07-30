import { Menu } from 'main/types/menu';
import { FC } from 'react';
import { toggleMenu } from 'renderer/features/menu-state/menuSlice';
import { useAppDispatch } from 'renderer/hooks';
import calendarTimeframeIcon from '../../../../../assets/icons/calendar-timeframe.svg';

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
