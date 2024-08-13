import attachmentIcon from '@assets/icons/attachment.svg';
import type { Link, Task } from '@remindr/shared';
import { getOpenableURL, LinkType, linkTypeLabels, Menu } from '@remindr/shared';
import store from '@renderer/app/store';
import { hideMenu, showDialog } from '@renderer/features/menu-state/menuSlice';
import { getEditedTask, setEditedTask } from '@renderer/features/task-modification/taskModificationSlice';
import { useAppDispatch, useAppSelector } from '@renderer/hooks';
import { getDefaultLink, getDisplayURL } from '@renderer/scripts/utils/linkutils';
import { isPrimaryMenuOpen } from '@renderer/scripts/utils/menuutils';
import { getFaviconURL, getObsidianNoteName, isObsidianURL } from '@renderer/scripts/utils/urlfunctions';
import type { FC } from 'react';
import { useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { isURL } from 'validator';
import CloseMenuButton from '../../close-menu-button/CloseMenuButton';
import { Dropdown } from '../../dropdown/Dropdown';
import { DynamicTextArea } from '../../dynamic-text-area/DynamicTextArea';
import { FullScreenMenu } from '../fullscreen-menu/FullScreenMenu';

// https://stackoverflow.com/a/38974272/5750490
const isFilePath = (url: string) => url !== window.electron.path.basename(url);

export const LinkMenu: FC = () => {
  const dispatch = useAppDispatch();

  const editedTask = useAppSelector((state) => getEditedTask(state.taskModificationState));
  // Is a link being created or edited?
  const linkEditState = useAppSelector((state) => state.taskModificationState.linkEditState);
  const creatingLink = linkEditState.state === 'create';

  const link: Link | undefined = creatingLink ? undefined : editedTask?.links[linkEditState.idx];

  const [updatedLink, setUpdatedLink] = useState<Link>(link ?? getDefaultLink());

  const handleLinkCompleteButton = () => {
    // Extensible version of updated link
    const updatedLinkClone = JSON.parse(JSON.stringify(updatedLink)) as Link;

    if (updatedLink.type === LinkType.Webpage) {
      if (!isURL(updatedLink.url)) {
        dispatch(showDialog({ title: 'Invalid URL', message: 'Please enter a valid URL.' }));
        return;
      }

      updatedLinkClone.faviconURL = getFaviconURL(getOpenableURL(updatedLink.url));
    }

    if (updatedLink.type === LinkType.File && !isFilePath(updatedLink.url)) {
      dispatch(showDialog({ title: 'Invalid File Path', message: 'Please select a file.' }));
      return;
    }

    if (updatedLink.type === LinkType.Obsidian) {
      if (!isObsidianURL(updatedLink.url) || getObsidianNoteName(updatedLink.url) === undefined) {
        dispatch(
          showDialog({
            title: 'Invalid Obsidian URL',
            message: 'Please enter a valid Obsidian URL.',
          }),
        );
        return;
      }

      updatedLinkClone.title = getObsidianNoteName(updatedLink.url)!;
    }

    const editedTaskClone = JSON.parse(JSON.stringify(editedTask)) as Task;
    if (creatingLink) {
      // Accounts for the case where the task was made before the links update
      if (editedTaskClone.links === undefined) editedTaskClone.links = [];

      // Avoid adding duplicate links (handles case where ctrl/cmd+s is pressed multiple times in quick succession)
      if (editedTaskClone.links.find((l) => l.id === updatedLinkClone.id)) return;

      editedTaskClone.links.push(updatedLinkClone);
    } else {
      editedTaskClone.links[linkEditState.idx] = updatedLinkClone;
    }

    dispatch(setEditedTask({ creating: undefined, task: editedTaskClone }));
    dispatch(hideMenu({ menu: Menu.LinkMenu }));
  };

  useHotkeys(
    'esc',
    () => {
      const competingMenuOpen = isPrimaryMenuOpen(store.getState().menuState);
      if (competingMenuOpen) return;

      dispatch(hideMenu({ menu: Menu.LinkMenu, fromEscKeypress: true }));
    },
    { enableOnFormTags: true },
  );
  useHotkeys('mod+s', handleLinkCompleteButton, { enableOnFormTags: true });

  return (
    <FullScreenMenu className="modal-menu menu" id="linkMenu">
      <div className="titlebar">
        <div>
          <h3>{`${creatingLink ? 'Add' : 'Edit'} Link`}</h3>
        </div>
        <CloseMenuButton onClick={() => dispatch(hideMenu({ menu: Menu.LinkMenu }))} />
      </div>
      <form className="contents">
        {getLinkEditor(updatedLink.type, updatedLink, setUpdatedLink)}
        <div>
          <p>Link type:</p>
          <Dropdown
            name="linkType"
            selectedIdx={Object.values(LinkType).indexOf(updatedLink.type)}
            options={Object.keys(LinkType)}
            optionLabels={linkTypeLabels}
            onSelect={(idx) => {
              const selectedLinkType = Object.values(LinkType)[idx];
              const updatedLinkClone = JSON.parse(JSON.stringify(updatedLink)) as Link;
              updatedLinkClone.type = selectedLinkType;

              // Clear URL if the link type is changed
              if (selectedLinkType !== updatedLink.type) {
                updatedLinkClone.url = '';
                updatedLinkClone.title = '';
                updatedLinkClone.faviconURL = '';
              }

              setUpdatedLink(updatedLinkClone);
            }}
          />
        </div>
        <button className="primary-button" onClick={handleLinkCompleteButton} type="button">
          {creatingLink
            ? `Add Link to ${linkTypeLabels[Object.values(LinkType).indexOf(updatedLink.type)]}`
            : 'Save Changes'}
        </button>
      </form>
    </FullScreenMenu>
  );
};

const getLinkEditor = (type: LinkType, updatedLink: Link, setUpdatedLink: (link: Link) => void) => {
  switch (type) {
    case LinkType.Webpage:
      return (
        <>
          <div>
            <label htmlFor="webpageLinkTitleInput">Title:</label>
            <DynamicTextArea
              id="webpageLinkTitleInput"
              placeholder="Insert title (auto-fills if empty)"
              maxLength={255}
              value={updatedLink.title}
              allowNewLine={false}
              onChange={(e) => {
                const updatedLinkClone = JSON.parse(JSON.stringify(updatedLink)) as Link;
                updatedLinkClone.title = e.currentTarget.value;
                setUpdatedLink(updatedLinkClone);
              }}
            />
          </div>
          <div>
            <label className="required" htmlFor="linkUrlInput">
              URL:
            </label>
            <DynamicTextArea
              id="linkUrlInput"
              placeholder="Enter URL here..."
              maxLength={255}
              value={updatedLink.url}
              autoFocus
              allowNewLine={false}
              onChange={(e) => {
                const updatedLinkClone = JSON.parse(JSON.stringify(updatedLink)) as Link;
                updatedLinkClone.url = e.currentTarget.value;
                setUpdatedLink(updatedLinkClone);
              }}
            />
          </div>
        </>
      );
    case LinkType.File:
      return (
        <div style={{ padding: '0 20px' }}>
          <button
            className="secondary-button"
            onClick={async () => {
              const fileURL = await openFileSelectionDialog();
              if (!fileURL) return;

              const updatedLinkClone = JSON.parse(JSON.stringify(updatedLink)) as Link;
              updatedLinkClone.url = fileURL;
              setUpdatedLink(updatedLinkClone);
            }}
            type="button"
          >
            <img src={attachmentIcon} alt="" />
            <p>Attach File</p>
          </button>
          {isFilePath(updatedLink.url) ? <p>{getDisplayURL(updatedLink)}</p> : <p>No file selected.</p>}
        </div>
      );
    case LinkType.Obsidian:
      return (
        <div>
          <label className="required" htmlFor="obsidianUrlInput">
            Obsidian URL:
          </label>
          <DynamicTextArea
            id="obsidianUrlInput"
            placeholder="Enter Obsidian URL here..."
            maxLength={255}
            value={updatedLink.url}
            autoFocus
            allowNewLine={false}
            onChange={(e) => {
              const updatedLinkClone = JSON.parse(JSON.stringify(updatedLink)) as Link;
              updatedLinkClone.url = e.currentTarget.value;
              updatedLinkClone.title = '';
              setUpdatedLink(updatedLinkClone);
            }}
          />
        </div>
      );
    default:
      throw new Error(`Invalid link type: ${type}`);
  }
};

async function openFileSelectionDialog(): Promise<string | undefined> {
  const fileInfo = await window.dialog.showOpenDialog({
    properties: ['openFile'],
  });

  return fileInfo.filePaths[0];
}
