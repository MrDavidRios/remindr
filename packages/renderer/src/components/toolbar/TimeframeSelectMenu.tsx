import { useClickOutside } from '@hooks/useoutsideclick';
import { Menu, Timeframe } from '@remindr/shared';
import { HotkeyScope } from '@renderer-types/hotkeyScope';
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
import { useEffect, useRef } from 'react';
import { useHotkeys, useHotkeysContext } from 'react-hotkeys-hook';
import { ArrowNavigable } from '../accessibility/ArrowNavigable';

interface CloseMenuProps {
  dispatch: AppDispatch;
  disableScope: (scope: string) => void;
  enableScope: (scope: string) => void;
  fromEscKeypress: boolean;
  previouslyEnabledScopes: string[];
}
const closeMenu = ({
  dispatch,
  disableScope,
  enableScope,
  fromEscKeypress,
  previouslyEnabledScopes,
}: CloseMenuProps) => {
  for (const scope of previouslyEnabledScopes) {
    enableScope(scope);
  }

  disableScope(HotkeyScope.Modal);

  dispatch(hideMenu({ menu: Menu.TimeframeMenu, fromEscKeypress }));
};

export function TimeframeSelectMenu() {
  const dispatch = useAppDispatch();
  const animationsEnabled = useAnimationsEnabled();
  const { enableScope, disableScope, enabledScopes } = useHotkeysContext();
  const previouslyEnabledScopes = useRef<string[]>(enabledScopes);

  const timeframeMenuBtnRef = useClickOutside(
    () =>
      closeMenu({
        dispatch,
        disableScope,
        enableScope,
        fromEscKeypress: false,
        previouslyEnabledScopes: previouslyEnabledScopes.current,
      }),
    ['#timeframeMenuButton'],
  );

  useHotkeys(
    'esc',
    () =>
      closeMenu({
        dispatch,
        disableScope,
        enableScope,
        fromEscKeypress: true,
        previouslyEnabledScopes: previouslyEnabledScopes.current,
      }),
    {
      scopes: HotkeyScope.Modal,
    },
  );

  useEffect(() => {
    previouslyEnabledScopes.current = enabledScopes;
    for (const scope of previouslyEnabledScopes.current) {
      disableScope(scope);
    }

    enableScope(HotkeyScope.Modal);
  }, []);

  const selectTimeframe = (timeframe: Timeframe) => {
    closeMenu({
      dispatch,
      disableScope,
      enableScope,
      fromEscKeypress: false,
      previouslyEnabledScopes: previouslyEnabledScopes.current,
    });
    dispatch(setTimeframe(timeframe));

    const selectedTasks = store.getState().taskList.selectedTasks;
    if (selectedTasks.length !== 1) return;

    const taskListOnScreen = getTaskListWithinTimeframe(store.getState().taskList.value, timeframe);
    const taskIdx = _.findIndex(taskListOnScreen, selectedTasks[0]);
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
