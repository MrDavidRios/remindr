import listIcon from '@assets/icons/list.svg';
import { Page } from '@remindr/shared';
import { updateCurrentPage } from '@renderer/features/page-state/pageState';
import { useAppDispatch } from '@renderer/hooks';
import type { FC } from 'react';

export const ListViewButton: FC = () => {
  const dispatch = useAppDispatch();

  return (
    <button
      type="button"
      id="listViewButton"
      className="toolbar-button"
      title="List View"
      onClick={() => dispatch(updateCurrentPage(Page.TaskListView))}
      aria-label="List View"
    >
      <div className="toolbar-button-img-container">
        <img src={listIcon} className="small" draggable="false" alt="" />
      </div>
    </button>
  );
};
