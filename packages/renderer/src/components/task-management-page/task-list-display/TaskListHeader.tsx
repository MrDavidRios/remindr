import settingsPanelIcon from '@assets/icons/settings-panel.svg';
import { SearchBar } from './SearchBar';
import { TaskSelectionBar } from './TaskSelectionBar';
import { Timeframe, getTimeframeDisplayName, Menu } from '@remindr/shared';
import { shallowEqual } from 'react-redux';
import { toggleMenu } from '/@/features/menu-state/menuSlice';
import { useAppDispatch, useAppSelector } from '/@/hooks';
import { isValidSearchString } from '/@/scripts/utils/searchutils';

interface TaskListHeaderProps {
  timeframe: Timeframe;
}

export function TaskListHeader(props: TaskListHeaderProps) {
  const { timeframe } = props;

  const dispatch = useAppDispatch();

  const selectedTasks = useAppSelector(state => state.taskList.selectedTasks, shallowEqual);
  const searchQuery = useAppSelector(state => state.taskList.searchQuery);

  const timeframeDisplayName = getTimeframeDisplayName(timeframe);
  const headerText = isValidSearchString(searchQuery)
    ? `Search results for "${searchQuery}":`
    : `${timeframeDisplayName}`;

  return (
    <div
      id="taskListTopBar"
      style={{ height: getHeaderWrapperHeight(timeframe) }}
    >
      {selectedTasks.length > 1 ? (
        <TaskSelectionBar selectedTasks={selectedTasks} />
      ) : (
        <div
          id="taskListHeaderContainer"
          className="frosted"
        >
          <div id="taskListHeaderLeft">
            <h3
              id="taskListTitle"
              title={isValidSearchString(searchQuery) ? headerText : ''}
            >
              {headerText}
            </h3>
          </div>
          <div style={{ display: 'flex', gap: 12, padding: '0 16px', position: 'relative' }}>
            <SearchBar />
            <button
              id="viewSettingsButton"
              className="accessible-button"
              type="button"
              onClick={() => dispatch(toggleMenu(Menu.TaskListViewSettingsMenu))}
              aria-label="Task list view settings"
            >
              <img
                src={settingsPanelIcon}
                className="svg-filter"
                draggable="false"
                title="Task List View Settings"
                alt=""
              />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function getHeaderWrapperHeight(timeframe: Timeframe) {
  return timeframe === Timeframe.Today ? '65px' : '50px';
}
