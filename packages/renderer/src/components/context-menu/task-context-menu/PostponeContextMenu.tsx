import angelRightIcon from '@assets/icons/angel-right.svg';
import snoozeIcon from '@assets/icons/snooze.svg';
import type { Task } from '@remindr/shared';
import type { AppDispatch } from '@renderer/app/store';
import { updateTask } from '@renderer/features/task-list/taskListSlice';
import { rgbaToHex } from '@renderer/scripts/utils/colorutils';
import { postponeTask } from '@renderer/scripts/utils/taskfunctions';
import type { FC } from 'react';
import { useEffect, useRef, useState } from 'react';
import { ArrowNavigable } from '../../accessibility/ArrowNavigable';

interface PostponeContextMenuProps {
  dropdownAction: (task: Task, action: (t: Task) => void) => void;
  task: Task;
  dispatch: AppDispatch;
}

export const PostponeContextMenu: FC<PostponeContextMenuProps> = ({ dropdownAction, task, dispatch }) => {
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const backgroundColor = rgbaToHex(getComputedStyle(document.documentElement).getPropertyValue('--surface-primary'));

  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const menu = ref.current;
    if (menu) {
      const { innerWidth, innerHeight } = window;
      const rect = menu.getBoundingClientRect();

      const parentRect = menu.parentElement?.getBoundingClientRect();
      const parentWidth = parentRect?.width || 0;
      const parentHeight = parentRect?.height || 0;

      const posX = rect.right > innerWidth ? position.x - rect.width - parentWidth : position.x;
      const posY = rect.bottom > innerHeight ? position.y - rect.height + parentHeight : position.y;

      setPosition({ x: posX, y: posY });
      setShowContextMenu(true); // Show the menu after the position has been calculated
    }
  }, [showContextMenu, ref]);

  return (
    <li
      className="menu-top-border"
      title="Postpone reminder"
      style={{ position: 'relative' }}
      onFocus={() => setShowContextMenu(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setShowContextMenu(false);
      }}
      onMouseOver={() => setShowContextMenu(true)}
      onMouseLeave={() => setShowContextMenu(false)}
    >
      <img src={snoozeIcon} className="task-tile-image" draggable="false" alt="" />
      <p>Postpone</p>
      <img src={angelRightIcon} className="task-tile-image" draggable="false" alt="" />
      {showContextMenu && (
        <ul
          className="menu frosted"
          ref={ref as unknown as React.RefObject<HTMLUListElement>}
          style={{ left: position.x, top: position.y, backgroundColor }}
        >
          <ArrowNavigable>
            <li
              onClick={() => dropdownAction(task, (t) => dispatch(updateTask(postponeTask(t, 30))))}
              title="Postpone for 30 minutes"
            >
              30 Minutes
            </li>
            <li
              onClick={() => dropdownAction(task, (t) => dispatch(updateTask(postponeTask(t, 60))))}
              className="menu-top-border"
              title="Postpone for 1 hour"
            >
              1 Hour
            </li>
            <li
              onClick={() => dropdownAction(task, (t) => dispatch(updateTask(postponeTask(t, 180))))}
              className="menu-top-border"
              title="Postpone for 3 hours"
            >
              3 Hours
            </li>
            <li
              onClick={() => dropdownAction(task, (t) => dispatch(updateTask(postponeTask(t, 720))))}
              className="menu-top-border"
              title="Postpone for 12 hours"
            >
              12 Hours
            </li>
            <li
              onClick={() => dropdownAction(task, (t) => dispatch(updateTask(postponeTask(t, 1440))))}
              className="menu-top-border"
              title="Postpone for 24 hours"
            >
              24 Hours
            </li>
          </ArrowNavigable>
        </ul>
      )}
    </li>
  );
};
