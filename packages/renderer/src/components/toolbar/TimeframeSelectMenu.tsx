import { useClickOutside } from '@hooks/useoutsideclick';
import { Menu, Timeframe } from '@remindr/shared';
import { menuWidthAnimationProps } from '@renderer/animation';
import store from '@renderer/app/store';
import { hideMenu } from '@renderer/features/menu-state/menuSlice';
import { clearSelectedTasks, setTimeframe } from '@renderer/features/task-list/taskListSlice';
import { useAppDispatch } from '@renderer/hooks';
import { getTaskListWithinTimeframe } from '@renderer/scripts/utils/getReminderListWithinTimeframe';
import { useAnimationsEnabled } from '@renderer/scripts/utils/hooks/useanimationsenabled';
import { useEscToClose } from '@renderer/scripts/utils/hooks/useesctoclose';
import { getTaskIdx } from '@renderer/scripts/utils/tasklistutils';
import { motion } from 'framer-motion';
import { ArrowNavigable } from '../accessibility/ArrowNavigable';

export function TimeframeSelectMenu() {
  const dispatch = useAppDispatch();
  const animationsEnabled = useAnimationsEnabled();

  const timeframeMenuBtnRef = useClickOutside(
    () => dispatch(hideMenu({ menu: Menu.TimeframeMenu })),
    ['#timeframeMenuButton'],
  );

  useEscToClose(dispatch, Menu.TimeframeMenu);

  const selectTimeframe = (timeframe: Timeframe) => {
    dispatch(hideMenu({ menu: Menu.TimeframeMenu }));
    dispatch(setTimeframe(timeframe));

    const selectedTasks = store.getState().taskList.selectedTasks;
    if (selectedTasks.length !== 1) return;

    const taskListOnScreen = getTaskListWithinTimeframe(store.getState().taskList.value, timeframe);
    const taskIdx = getTaskIdx(selectedTasks[0], taskListOnScreen);
    if (taskIdx === -1) dispatch(clearSelectedTasks());
  };

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
          onClick={() => selectTimeframe(Timeframe.All)}
        >
          All
        </div>
        <div
          id="timeframeTodo"
          className="timeframe-choice menu-bottom-border"
          onClick={() => selectTimeframe(Timeframe.Todo)}
        >
          To-Do
        </div>

        <div id="timeframeToday" className="timeframe-choice" onClick={() => selectTimeframe(Timeframe.Today)}>
          Today
        </div>
        <div id="timeframeTomorrow" className="timeframe-choice" onClick={() => selectTimeframe(Timeframe.Tomorrow)}>
          Tomorrow
        </div>
        <div id="timeframeThisWeek" className="timeframe-choice" onClick={() => selectTimeframe(Timeframe.ThisWeek)}>
          This Week
        </div>
        <div id="timeframeNextWeek" className="timeframe-choice" onClick={() => selectTimeframe(Timeframe.NextWeek)}>
          Next Week
        </div>
        <div
          id="timeframeOverdue"
          className="timeframe-choice menu-top-border overdue"
          onClick={() => selectTimeframe(Timeframe.Overdue)}
        >
          Overdue
        </div>
      </ArrowNavigable>
    </motion.div>
  );
}
