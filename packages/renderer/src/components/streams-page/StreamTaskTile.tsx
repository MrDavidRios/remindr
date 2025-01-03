import extraMenuIcon from '@assets/icons/extra-menu.png';
import { ContextMenuType, StreamTask } from '@remindr/shared';
import store from '@renderer/app/store';
import { hideContextMenu, showContextMenu } from '@renderer/features/menu-state/menuSlice';
import { useAppDispatch } from '@renderer/hooks';
import { useAnimationsEnabled } from '@renderer/scripts/utils/hooks/useanimationsenabled';
import { Reorder, useMotionValue } from 'framer-motion';
import React, { useEffect, useRef } from 'react';
import { TaskCompleteButton } from '../task-management-page/task-list-display/task-tile/TaskCompleteButton';

interface StreamTaskTileProps {
  streamTask: StreamTask;
  onToggleCompleteTask: (task: StreamTask) => void;
  onReorderComplete?: () => void;
  showConnector?: boolean;
}

export const StreamTaskTile: React.FC<StreamTaskTileProps> = ({
  streamTask,
  onToggleCompleteTask,
  onReorderComplete,
  showConnector,
}) => {
  const dispatch = useAppDispatch();
  const animationsEnabled = useAnimationsEnabled();

  const reorderableComponentRef = useRef<HTMLElement>(null);
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

  return (
    <Reorder.Item
      className={`stream-task-tile ${streamTask.completed ? 'completed' : ''}`}
      key={streamTask.creationTime}
      value={streamTask}
      style={{ y }}
      onPointerUp={onReorderComplete}
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
      onClick={(e: React.MouseEvent<HTMLLIElement, MouseEvent>) => {
        // Detail is 0 when the click is triggered by a keyboard event (spacebar)
        if (e.detail === 0) return;

        if (ignorePointerEvents.current) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }
      }}
      ref={reorderableComponentRef}
      transition={animationsEnabled ? {} : { duration: 0, ease: 'linear' }}
      layout={animationsEnabled ? 'position' : undefined}
    >
      <TaskCompleteButton task={streamTask} toggleComplete={() => onToggleCompleteTask(streamTask)} />
      <p>{streamTask.name}</p>
      <div className="more-options-btn-wrapper">
        <button title="More options" ref={moreOptionsBtnRef} onClick={toggleContextMenu}>
          <img src={extraMenuIcon} alt="More options" />
        </button>
      </div>
      {showConnector && <div className="stream-task-connector" />}
    </Reorder.Item>
  );
};
