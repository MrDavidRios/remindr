import pathIcon from '@assets/icons/path.svg';
import { Page } from '@remindr/shared';
import { updateCurrentPage } from '@renderer/features/page-state/pageState';
import { useAppDispatch } from '@renderer/hooks';
import type { FC } from 'react';

export const StreamEditorButton: FC = () => {
  const dispatch = useAppDispatch();

  return (
    <button
      type="button"
      id="streamMenuButton"
      className="toolbar-button"
      title="Stream View"
      onClick={() => dispatch(updateCurrentPage(Page.StreamEditor))}
      aria-label="Stream View"
    >
      <div className="toolbar-button-img-container">
        <img src={pathIcon} className="small" draggable="false" alt="" style={{ width: 24 }} />
      </div>
    </button>
  );
};
