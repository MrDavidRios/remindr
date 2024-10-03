import carouselIcon from '@assets/icons/carousel.svg';
import { Page } from '@remindr/shared';
import { updateCurrentPage } from '@renderer/features/page-state/pageState';
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
      onClick={() => dispatch(updateCurrentPage(Page.ColumnView))}
      aria-label="Column View"
    >
      <div className="toolbar-button-img-container">
        <img src={carouselIcon} className="small" draggable="false" alt="" />
      </div>
    </button>
  );
};
