import extraMenuIcon from '@assets/icons/extra-menu.png';
import { ContextMenuType, StreamTask } from '@remindr/shared';
import store from '@renderer/app/store';
import { hideContextMenu, showContextMenu, showDialog } from '@renderer/features/menu-state/menuSlice';
import { useAppDispatch } from '@renderer/hooks';
import { useAnimationsEnabled } from '@renderer/scripts/utils/hooks/useanimationsenabled';
import { useClickOutside } from '@renderer/scripts/utils/hooks/useoutsideclick';
import { Reorder, useMotionValue } from 'framer-motion';
import React, { useEffect, useRef, useState } from 'react';
import { DynamicTextArea } from '../dynamic-text-area/DynamicTextArea';
import { SaveButtons } from '../save-buttons/SaveButtons';
import { TaskCompleteButton } from '../task-management-page/task-list-display/task-tile/TaskCompleteButton';

interface StreamTaskTileProps {
  streamTask: StreamTask;
  onChange: (updatedTask: StreamTask) => void;
  onReorderComplete?: () => void;
  showConnector?: boolean;
}

export const StreamTaskTile: React.FC<StreamTaskTileProps> = ({
  streamTask,
  onChange,
  onReorderComplete,
  showConnector,
}) => {
  const dispatch = useAppDispatch();
  const animationsEnabled = useAnimationsEnabled();

  const [editingName, setEditingName] = useState(false);
  const [editedName, setEditedName] = useState(streamTask.name);

  const ignorePointerEvents = useRef<boolean>(false);
  const y = useMotionValue(0);

  // Fixes this bug: https://github.com/framer/motion/issues/1404
  // https://github.com/rashidshamloo/fem_034_todo-app/blob/main/src/components/Todo.tsx
  // This disabled pointer events until the task tile reaches its destination
  useEffect(() => {
    const handleDragStyle = (yPos: number) => {
      if (yPos === 0) {
        ignorePointerEvents.current = false;
        return;
      }

      ignorePointerEvents.current = true;
      setTimeout(() => {
        if (y.get() === yPos) y.set(0);
      }, 50);
    };
    const unsubscribe = y.on('change', handleDragStyle);
    return () => unsubscribe();
  }, [y]);

  const moreOptionsBtnRef = useRef<HTMLButtonElement>(null);
  const toggleContextMenu = () => {
    const ctxMenuVisible = store.getState().menuState.openContextMenus.includes(ContextMenuType.StreamTaskContextMenu);

    if (ctxMenuVisible) {
      dispatch(hideContextMenu(ContextMenuType.StreamTaskContextMenu));
    } else {
      dispatch(
        showContextMenu({
          contextMenu: ContextMenuType.StreamTaskContextMenu,
          x: moreOptionsBtnRef.current?.getBoundingClientRect().x ?? 0,
          y: moreOptionsBtnRef.current?.getBoundingClientRect().bottom ?? 0,
          streamTask,
        }),
      );
    }
  };

  const onChangeName = () => {
    if (editedName.trim() === '') {
      dispatch(showDialog({ title: 'Invalid Name', message: 'Make sure your task has a name.' }));
      setEditedName(streamTask.name);
      return;
    }

    const updatedTask = { ...streamTask, name: editedName };
    onChange(updatedTask);

    setEditingName(false);
  };

  const cancelNameChange = () => {
    setEditedName(streamTask.name);
    setEditingName(false);
  };

  const onToggleCompletion = () => {
    const updatedTask = { ...streamTask, completed: !streamTask.completed };
    onChange(updatedTask);
  };

  const ref = useClickOutside(() => setEditingName(false));

  return (
    <Reorder.Item
      className={`stream-task-tile ${streamTask.completed ? 'completed' : ''} ${editingName ? 'editing' : ''}`}
      key={streamTask.creationTime}
      value={streamTask}
      style={{ y }}
      onPointerUp={onReorderComplete}
      dragListener={!editingName}
      onContextMenu={(e: React.MouseEvent<HTMLLIElement, MouseEvent>) => {
        dispatch(
          showContextMenu({
            contextMenu: ContextMenuType.StreamTaskContextMenu,
            streamTask,
            x: e.clientX,
            y: e.clientY,
          }),
        );
      }}
      onKeyDown={(e: React.KeyboardEvent<HTMLLIElement>) => {
        if (e.key === 'Enter' && !editingName) {
          setEditingName(true);
        }
      }}
      onDoubleClick={(e: React.MouseEvent<HTMLLIElement, MouseEvent>) => {
        // Detail is 0 when the click is triggered by a keyboard event (spacebar)
        if (e.detail === 0) return;

        if (ignorePointerEvents.current) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }

        setEditingName(true);
      }}
      transition={animationsEnabled ? {} : { duration: 0, ease: 'linear' }}
      layout={animationsEnabled ? 'position' : undefined}
    >
      <TaskCompleteButton task={streamTask} toggleComplete={onToggleCompletion} />
      {editingName ? (
        <div
          id="streamTaskTitleInputWrapper"
          ref={ref as any}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              e.stopPropagation();

              onChangeName();
            }
            if (e.key === 'Escape') {
              cancelNameChange();
            }
          }}
        >
          <DynamicTextArea
            aria-label="stream task title input"
            placeholder="Enter a title"
            maxLength={255}
            value={editedName}
            autoFocus
            allowNewLine={false}
            onChange={(e) => {
              setEditedName(e.currentTarget.value);
            }}
          />
          <SaveButtons onSave={onChangeName} onCancel={cancelNameChange} />
        </div>
      ) : (
        <p>{editedName}</p>
      )}
      <div className="more-options-btn-wrapper">
        <button title="More options" ref={moreOptionsBtnRef} onClick={toggleContextMenu}>
          <img src={extraMenuIcon} alt="More options" draggable={false} />
        </button>
      </div>
      {showConnector && <div className="stream-task-connector" />}
    </Reorder.Item>
  );
};
