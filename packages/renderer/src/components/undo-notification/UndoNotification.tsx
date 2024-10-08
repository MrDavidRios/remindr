import closeButtonIcon from '@assets/icons/close-button.png';
import openIcon from '@assets/icons/open.svg';
import { getTaskListActionVerb, Task } from '@remindr/shared';
import store from '@renderer/app/store';
import { removeSelectedTask, setSelectedTask, undoTaskListChange } from '@renderer/features/task-list/taskListSlice';
import { useAppSelector } from '@renderer/hooks';
import { useAnimationsEnabled } from '@renderer/scripts/utils/hooks/useanimationsenabled';
import { isFullscreenMenuOpen } from '@renderer/scripts/utils/menuutils';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useDispatch } from 'react-redux';

let hideNotificationTimeout: NodeJS.Timeout;
export function UndoNotification() {
  const dispatch = useDispatch();

  useHotkeys('mod+z', () => {
    if (isFullscreenMenuOpen(store.getState().menuState)) return;
    undoTaskAction();
  });

  const undoState = useAppSelector((state) => state.taskList.lastTaskListAction);
  const updatedTask = useAppSelector(
    (state) => state.taskList.value.filter((t: Task) => t.creationTime === undoState?.task.creationTime)[0],
  );
  const [showUndoNotification, setShowUndoNotification] = useState(false);

  const canOpenTask = updatedTask && undoState?.type !== 'remove';
  const openTask = () => {
    // Don't open the task if the undo notification isn't showing
    if (!showUndoNotification) return;

    dispatch(setSelectedTask(updatedTask));
    setShowUndoNotification(false);
  };

  useHotkeys('mod+o', openTask);

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

  function undoTaskAction() {
    if (undoState?.task !== undefined) dispatch(removeSelectedTask(undoState?.task));
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

  return (
    <AnimatePresence>
      {showUndoNotification && (
        <motion.div id="undoActionNotification" className="frosted" {...animationProps}>
          <div
            className="text-wrapper"
            title={`Task "${undoState?.task.name}" ${actionVerb}`}
            style={{ maxWidth: `calc(100vw - ${158 + buttonWidth * visibleButtons}px)` }}
          >
            <p>Task &quot;</p> <span>{`${undoState?.task.name}`}</span>
            <p>{`" ${actionVerb}`}</p>
          </div>
          <button title="Undo Action (Ctrl + Z)" onClick={undoTaskAction} type="button">
            Undo
          </button>
          <div className="action-button-wrapper">
            {canOpenTask && (
              <button
                type="button"
                className="open-button view-task-button"
                title="Open task (Ctrl + O)"
                onClick={openTask}
              >
                <img src={openIcon} alt="Open task" className="ignore-cursor svg-filter" draggable="false" />
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
}
