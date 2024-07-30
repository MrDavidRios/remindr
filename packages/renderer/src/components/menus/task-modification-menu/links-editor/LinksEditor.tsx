import Task from 'main/types/classes/task/task';
import { Menu } from 'main/types/menu';
import { generateUniqueID } from 'main/utils/idutils';
import { FC, useState } from 'react';
import { ArrowNavigable } from 'renderer/components/accessibility/ArrowNavigable';
import { showMenu } from 'renderer/features/menu-state/menuSlice';
import {
  getEditedTask,
  setEditedTask,
  setLinkEditState,
} from 'renderer/features/task-modification/taskModificationSlice';
import { useAppDispatch, useAppSelector } from 'renderer/hooks';
import linkIcon from '../../../../../../assets/icons/link.svg';
import plusIcon from '../../../../../../assets/icons/plus.svg';
import { LinkTile } from './LinkTile';

interface LinksEditorProps {}

export const LinksEditor: FC<LinksEditorProps> = () => {
  const dispatch = useAppDispatch();

  const [hoveringOverEditor, setHoveringOverEditorHeader] = useState(false);

  const openLinkMenu = (idx = -1) => {
    dispatch(setLinkEditState({ idx, state: idx === -1 ? 'create' : 'edit' }));
    dispatch(showMenu(Menu.LinkMenu));
  };

  const editedTask = useAppSelector((state) => getEditedTask(state.taskModificationState));
  const links = editedTask?.links ?? [];

  const onDeleteLink = (idx: number) => {
    const editedTaskClone = JSON.parse(JSON.stringify(editedTask)) as Task;
    editedTaskClone.links.splice(idx, 1);
    dispatch(setEditedTask({ creating: undefined, task: editedTaskClone }));
  };

  const onDuplicateLink = (idx: number) => {
    const editedTaskClone = JSON.parse(JSON.stringify(editedTask)) as Task;
    const linkClone = JSON.parse(JSON.stringify(editedTaskClone.links[idx]));
    linkClone.id = generateUniqueID();
    editedTaskClone.links.splice(idx + 1, 0, linkClone);
    dispatch(setEditedTask({ creating: undefined, task: editedTaskClone }));
  };

  return (
    <div className="links-editor">
      <div
        className="links-editor-header"
        onMouseEnter={() => setHoveringOverEditorHeader(true)}
        onMouseLeave={() => setHoveringOverEditorHeader(false)}
      >
        <button type="button" onClick={() => openLinkMenu()}>
          <div>
            <img src={linkIcon} draggable={false} alt="" />
            <h4>Links</h4>
          </div>
          <img
            src={plusIcon}
            draggable={false}
            alt="Add link"
            style={{ visibility: hoveringOverEditor ? 'visible' : 'hidden' }}
          />
        </button>
      </div>
      <ArrowNavigable className={`links-container ${links.length > 0 ? 'has-items' : ''}`}>
        {links.map((link, idx) => {
          return (
            <LinkTile
              link={link}
              key={link.id}
              onEditLink={() => openLinkMenu(idx)}
              onDuplicateLink={() => onDuplicateLink(idx)}
              onDeleteLink={() => onDeleteLink(idx)}
            />
          );
        })}
      </ArrowNavigable>
    </div>
  );
};
