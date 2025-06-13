import closeButtonIcon from '@assets/icons/close-button.png';
import openIcon from '@assets/icons/open.svg';
import { getTaskListActionVerb, Menu } from '@remindr/shared';
import { hideMenu, showMenu } from '@renderer/features/menu-state/menuSlice';
import {
  setSelectedTasks,
  undoTaskListChange,
} from '@renderer/features/task-list/taskListSlice';
import { useAppDispatch, useAppSelector } from '@renderer/hooks';
import { useAnimationsEnabled } from '@renderer/scripts/utils/hooks/useanimationsenabled';
import { useHotkey } from '@renderer/scripts/utils/hooks/usehotkey';
import { AnimatePresence, motion } from 'framer-motion';
import { FC, useEffect, useState } from 'react';

let hideNotificationTimeout: NodeJS.Timeout;
export const UndoNotification: FC = () => {
  const dispatch = useAppDispatch();

  const undoState = useAppSelector((state) => state.taskList.lastTaskListAction);
  const [showUndoNotification, setShowUndoNotification] = useState(false);

  const multipleTasksInLastAction = undoState?.tasks?.length !== undefined && undoState.tasks.length > 1;
  const canOpenTask = undoState?.type !== 'remove';
  const openTask = () => {
    // Don't open the task if the undo notification isn't showing
    if (!showUndoNotification) return;
    if (undoState === undefined || undoState.tasks.length === 0) return;

    dispatch(setSelectedTasks(undoState.tasks));
    setShowUndoNotification(false);
  };

  useHotkey(['mod+o'], () => openTask(), Menu.None);
  useHotkey(['mod+z'], () => undoTaskAction(), Menu.None);

  useHotkey(['esc'], () => setShowUndoNotification(false), Menu.None, { prioritize: true });

  useEffect(() => {
    if (hideNotificationTimeout) clearTimeout(hideNotificationTimeout);

    if (!undoState || undoState?.undone) {
      setShowUndoNotification(false);
      return;
    }

    setShowUndoNotification(true);

    hideNotificationTimeout = setTimeout(() => {
      setShowUndoNotification(false);
    }, 5000);
  }, [undoState]);

  // Keep undo notification state updated in Redux to maintain correct menu closing priority
  useEffect(() => {
    if (showUndoNotification) dispatch(showMenu(Menu.UndoNotification));
    else dispatch(hideMenu({ menu: Menu.UndoNotification }));
  }, [showUndoNotification]);

  function undoTaskAction() {
    dispatch(undoTaskListChange());
  }

  const animate = useAnimationsEnabled();
  const animationProps = animate
    ? {
      initial: { opacity: 0, y: 50 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: 50 },
    }
    : {};

  const actionVerb = getTaskListActionVerb(undoState?.type ?? 'add');

  const visibleButtons = 1 + (canOpenTask ? 1 : 0);
  const buttonWidth = 40;

  const undoNotificationCopy = multipleTasksInLastAction
    ? `${undoState?.tasks.length} tasks ${actionVerb}` : `Task "${undoState?.tasks[0].name}" ${actionVerb}`;
  const openTasksCopy = multipleTasksInLastAction ? "Select tasks" : "Open task"

  return (
    <AnimatePresence>
      {showUndoNotification && (
        <motion.div id="undoActionNotification" className="frosted" {...animationProps}>
          <div
            className="text-wrapper"
            title={undoNotificationCopy}
            style={{ maxWidth: `calc(100vw - ${158 + buttonWidth * visibleButtons}px)` }}
          >
            {
              multipleTasksInLastAction ? (
                <p>{undoNotificationCopy}</p>
              ) :
                (<>
                  <p>Task &quot;</p>
                  <span>{`${undoState?.tasks[0].name}`} </span>
                  <p>{`" ${actionVerb}`}</p>
                </>)
            }
          </div>
          <button title="Undo Action (Ctrl + Z)" onClick={undoTaskAction} type="button">
            Undo
          </button>
          <div className="action-button-wrapper">
            {canOpenTask && (
              <button
                type="button"
                className="open-button view-task-button"
                title={`${openTasksCopy} (Ctrl + O)`}
                onClick={openTask}
              >
                <img src={openIcon} alt={openTasksCopy} className="ignore-cursor svg-filter" draggable="false" />
              </button>
            )}
            <button
              type="button"
              title="Close Undo Notification"
              aria-label="Close Undo Notification"
              onClick={() => setShowUndoNotification(false)}
            >
              <img src={closeButtonIcon} draggable="false" alt="" style={{ marginRight: 2 }} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
