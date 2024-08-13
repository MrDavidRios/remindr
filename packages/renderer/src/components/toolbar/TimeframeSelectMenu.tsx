import { useClickOutside } from '@hooks/useoutsideclick';
import { Menu, Timeframe } from '@remindr/shared';
import { menuWidthAnimationProps } from '@renderer/animation';
import type { AppDispatch } from '@renderer/app/store';
import store from '@renderer/app/store';
import { hideMenu } from '@renderer/features/menu-state/menuSlice';
import { clearSelectedTasks, setTimeframe } from '@renderer/features/task-list/taskListSlice';
import { useAppDispatch } from '@renderer/hooks';
import { getTaskListWithinTimeframe } from '@renderer/scripts/utils/getReminderListWithinTimeframe';
import { useAnimationsEnabled } from '@renderer/scripts/utils/hooks/useanimationsenabled';
import { motion } from 'framer-motion';
import _ from 'lodash';
import { useHotkeys } from 'react-hotkeys-hook';
import { ArrowNavigable } from '../accessibility/ArrowNavigable';

export function TimeframeSelectMenu() {
  const dispatch = useAppDispatch();

  const timeframeMenuBtnRef = useClickOutside(
    () => dispatch(hideMenu({ menu: Menu.TimeframeMenu })),
    ['#timeframeMenuButton'],
  );
  const animationsEnabled = useAnimationsEnabled();

  useHotkeys('esc', () => dispatch(hideMenu({ menu: Menu.TimeframeMenu, fromEscKeypress: true })));

  return (
    <motion.div
      id="timeframeChoiceWindow"
      className="frosted"
      ref={timeframeMenuBtnRef as unknown as React.RefObject<HTMLDivElement>}
      {...menuWidthAnimationProps(animationsEnabled)}
      animate={{ width: '100px' }}
    >
      <ArrowNavigable autoFocus disableCleanup>
        <div
          id="timeframeAll"
          className="timeframe-choice menu-bottom-border"
          onClick={() => selectTimeframe(Timeframe.All, dispatch)}
        >
          All
        </div>
        <div
          id="timeframeTodo"
          className="timeframe-choice menu-bottom-border"
          onClick={() => selectTimeframe(Timeframe.Todo, dispatch)}
        >
          To-Do
        </div>

        <div
          id="timeframeToday"
          className="timeframe-choice"
          onClick={() => selectTimeframe(Timeframe.Today, dispatch)}
        >
          Today
        </div>
        <div
          id="timeframeTomorrow"
          className="timeframe-choice"
          onClick={() => selectTimeframe(Timeframe.Tomorrow, dispatch)}
        >
          Tomorrow
        </div>
        <div
          id="timeframeThisWeek"
          className="timeframe-choice"
          onClick={() => selectTimeframe(Timeframe.ThisWeek, dispatch)}
        >
          This Week
        </div>
        <div
          id="timeframeNextWeek"
          className="timeframe-choice"
          onClick={() => selectTimeframe(Timeframe.NextWeek, dispatch)}
        >
          Next Week
        </div>
        <div
          id="timeframeOverdue"
          className="timeframe-choice menu-top-border overdue"
          onClick={() => selectTimeframe(Timeframe.Overdue, dispatch)}
        >
          Overdue
        </div>
      </ArrowNavigable>
    </motion.div>
  );
}

function selectTimeframe(timeframe: Timeframe, dispatch: AppDispatch) {
  dispatch(hideMenu({ menu: Menu.TimeframeMenu }));
  dispatch(setTimeframe(timeframe));

  const selectedTasks = store.getState().taskList.selectedTasks;
  if (selectedTasks.length !== 1) return;

  const taskListOnScreen = getTaskListWithinTimeframe(store.getState().taskList.value, timeframe);
  const taskIdx = _.findIndex(taskListOnScreen, selectedTasks[0]);
  if (taskIdx === -1) dispatch(clearSelectedTasks());
}
