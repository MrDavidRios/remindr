import pasteIcon from '@assets/icons/paste.svg';
import plusIcon from '@assets/icons/plus.svg';
import { Menu } from '@remindr/shared';
import { setFloatingMenuPosition, showMenu, toggleMenu } from '@renderer/features/menu-state/menuSlice';
import { setFocusedTaskColumn } from '@renderer/features/task-columns/taskColumnSlice';
import { useAppDispatch, useAppStore } from '@renderer/hooks';
import { convertDOMRectToMenuRect } from '@renderer/scripts/utils/menuutils';
import { motion } from 'framer-motion';
import { useRef } from 'react';

interface TaskColumnActionBarProps {
  columnIdx: number;
  newTaskTileOpen: boolean;
  onAddTask: () => void;
}

export const TaskColumnActionBar: React.FC<TaskColumnActionBarProps> = ({ columnIdx, newTaskTileOpen, onAddTask }) => {
  const dispatch = useAppDispatch();
  const store = useAppStore();

  const addExistingReminderButtonRef = useRef<HTMLButtonElement>(null);

  const onClickAddExternalTaskButton = () => {
    const changedFocusedColumn = store.getState().taskColumns.focusedTaskColumnIdx !== columnIdx;

    dispatch(setFocusedTaskColumn(columnIdx));

    if (changedFocusedColumn) dispatch(showMenu(Menu.AddExistingReminderMenu));
    else dispatch(toggleMenu(Menu.AddExistingReminderMenu));

    const anchor = addExistingReminderButtonRef.current?.getBoundingClientRect();

    dispatch(
      setFloatingMenuPosition({
        menu: Menu.AddExistingReminderMenu,
        positionInfo: {
          anchor: convertDOMRectToMenuRect(anchor),
          yOffset: {
            topAnchored: 6,
            bottomAnchored: 6,
          },
          gap: 0,
        },
      }),
    );
  };

  return (
    <motion.div className="task-column-action-bar">
      {!newTaskTileOpen && (
        <>
          <button onClick={onAddTask} style={{ marginTop: 12 }}>
            <img src={plusIcon} draggable={false} alt="" />
            Add task
          </button>
          <button
            ref={addExistingReminderButtonRef}
            onClick={onClickAddExternalTaskButton}
            style={{ marginTop: 12 }}
            className="add-external-task-button"
            title="Add existing task"
          >
            <img src={pasteIcon} draggable={false} alt="" />
          </button>
        </>
      )}
    </motion.div>
  );
};
