import fileIcon from '@assets/icons/attachment.svg';
import duplicateIcon from '@assets/icons/duplicate.svg';
import folderIcon from '@assets/icons/folder.svg';
import brokenLinkIcon from '@assets/icons/link-broken.svg';
import pencilIcon from '@assets/icons/pencil.svg';
import deleteIcon from '@assets/icons/plus-thin.svg';
import webpageIcon from '@assets/icons/webpage.svg';
import type { Link, Task } from '@remindr/shared';
import { getOpenableURL, LinkType } from '@remindr/shared';
import store from '@renderer/app/store';
import { setEditedTask } from '@renderer/features/task-modification/taskModificationSlice';
import { useAppDispatch } from '@renderer/hooks';
import { getDisplayURL, openLink } from '@renderer/scripts/utils/linkutils';
import { delay } from '@renderer/scripts/utils/timing';
import type { FC } from 'react';
import { useEffect, useRef, useState } from 'react';
import isURL from 'validator/lib/isURL';

interface LinkTileProps {
  link: Link;
  onEditLink: () => void;
  onDuplicateLink: () => void;
  onDeleteLink: () => void;
}

export const LinkTile: FC<LinkTileProps> = ({ link, onEditLink, onDuplicateLink, onDeleteLink }) => {
  const dispatch = useAppDispatch();

  const linkIsFile = link.type === LinkType.File;
  const displayURL = getDisplayURL(link);

  const fileExists = linkIsFile && window.fs.existsSync(link.url);
  let icon = linkIsFile || link.type === LinkType.Obsidian ? fileIcon : webpageIcon;
  if (linkIsFile && !fileExists) icon = brokenLinkIcon;

  const usingFavicon = link.type === LinkType.Webpage && isURL(link.faviconURL ?? '');
  if (usingFavicon) icon = link.faviconURL;

  const [showActionButtons, setShowActionButtons] = useState(false);

  const actionButtonsRef = useRef<HTMLDivElement>(null);
  const [actionButtonsWidth, setActionButtonsWidth] = useState(0);

  useEffect(() => {
    setActionButtonsWidth(actionButtonsRef.current?.getBoundingClientRect().width ?? 0);
  }, [showActionButtons]);

  useEffect(() => {
    const loadPageTitle = async () => {
      try {
        const pageTitle = await window.electron.shell.getPageTitle(getOpenableURL(link.url));

        if (pageTitle) {
          const creatingTask = store.getState().taskModificationState.lastEditType === 'create';
          const taskState = creatingTask
            ? store.getState().taskModificationState.taskCreationState
            : store.getState().taskModificationState.taskEditState;

          const editedTaskClone = JSON.parse(JSON.stringify(taskState.editedTask)) as Task;

          const linkIdx = editedTaskClone?.links?.findIndex((l) => l.id === link.id);

          if (!editedTaskClone || linkIdx === undefined || editedTaskClone?.links[linkIdx] === undefined) return;

          const linkClone = JSON.parse(JSON.stringify(editedTaskClone?.links[linkIdx])) as Link;
          linkClone.title = pageTitle;
          editedTaskClone.links[linkIdx] = linkClone;

          dispatch(setEditedTask({ creating: undefined, task: editedTaskClone }));
        }
      } catch (e) {
        console.error(e);
      }
    };

    if (link.type !== LinkType.Webpage || link.title.trim().length > 0) return;

    loadPageTitle();
  }, [link.title]);

  let title = `Open ${displayURL}`;
  if (linkIsFile && !fileExists) title = `${displayURL} not found`;
  if (link.type === LinkType.Obsidian) title += ' note in Obsidian';

  const handleLinkTileClick = () => {
    if (linkIsFile && !fileExists) return;
    openLink(link);
  };

  return (
    <li
      className="link-tile"
      onClick={handleLinkTileClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') handleLinkTileClick();
      }}
      onMouseEnter={() => setShowActionButtons(true)}
      onFocusCapture={() => setShowActionButtons(true)}
      onMouseLeave={() => setShowActionButtons(false)}
      onBlur={async () => {
        await delay(0);

        if (actionButtonsRef.current?.contains(document.activeElement)) return;
        setShowActionButtons(false);
      }}
      style={{
        gridTemplateColumns: showActionButtons
          ? `calc(100% - ${actionButtonsWidth}px) ${actionButtonsWidth}px`
          : '100%',
      }}
      tabIndex={0}
      title={title}
    >
      <div>
        <img
          src={icon}
          alt={linkIsFile ? 'File' : 'Webpage'}
          draggable={false}
          className={usingFavicon ? 'favicon' : ''}
        />
        <p>{displayURL}</p>
      </div>
      {showActionButtons && (
        <div
          ref={actionButtonsRef}
          className="action-buttons"
          // Prevents a flicker when transitioning from invisible to visible action buttons
          style={{ visibility: actionButtonsWidth > 0 ? 'visible' : 'hidden' }}
        >
          {linkIsFile && fileExists && (
            <button
              className="action-button accessible-button"
              onKeyDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                window.electron.shell.showInFolder(link.url);
              }}
              type="button"
            >
              <img
                src={folderIcon}
                className="action-button svg-filter"
                draggable={false}
                title="Show in system explorer"
                alt="Show in system explorer"
                style={{ width: 17, height: 17 }}
              />
            </button>
          )}
          <button
            className="action-button accessible-button"
            onKeyDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onEditLink();
            }}
            type="button"
          >
            <img
              src={pencilIcon}
              className="action-button svg-filter"
              draggable={false}
              title="Edit Link"
              alt="Edit Link"
            />
          </button>

          <button
            className="action-button accessible-button"
            onKeyDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onDuplicateLink();
            }}
            type="button"
          >
            <img
              src={duplicateIcon}
              className="action-button svg-filter"
              draggable={false}
              title="Duplicate Link"
              alt="Duplicate Link"
            />
          </button>
          <button
            className="action-button accessible-button"
            onKeyDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onDeleteLink();
            }}
            type="button"
          >
            <img
              src={deleteIcon}
              className="action-button svg-filter"
              draggable={false}
              title="Delete Link"
              alt="Delete Link"
              style={{ transform: 'rotate(45deg)' }}
            />
          </button>
        </div>
      )}
    </li>
  );
};
