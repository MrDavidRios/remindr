import carouselIcon from '@assets/icons/carousel.svg';
import { updateSetting } from '@renderer/features/settings/settingsSlice';
import { useAppDispatch } from '@renderer/hooks';
import type { FC } from 'react';

export const ColumnsViewButton: FC = () => {
  const dispatch = useAppDispatch();

  return (
    <button
      type="button"
      id="columnsMenuButton"
      className="toolbar-button"
      title="Column View"
      onClick={() => dispatch(updateSetting({ key: 'columnView', value: true }))}
      aria-label="Column View"
    >
      <div className="toolbar-button-img-container">
        <img src={carouselIcon} className="small" draggable="false" alt="" />
      </div>
    </button>
  );
};
