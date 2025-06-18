import { setupTestStore } from '@mocks/store-utils';
import { mockTaskListState, testTask } from '@mocks/testObjs';
import store from '@renderer/app/store';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { removeTasksReducer } from '../basicTaskListOperations';
import { taskListSlice, TaskListState } from '../taskListSlice';

describe('Remove Task Reducer', () => {
    beforeEach(() => {
        const mockedStore = setupTestStore({
            taskList: {
                ...mockTaskListState,
                taskListGetStatus: 'succeeded',
            },
        });

        vi.mocked(store.getState).mockReturnValue(mockedStore.getState());
    });

    it('correctly removes a single task', () => {
        const saveDataMock = vi.fn();
        const state: TaskListState = JSON.parse(JSON.stringify(mockTaskListState));
        state.value = [testTask];

        removeTasksReducer(
            state,
            { payload: [testTask], type: 'removeTasks' },
            saveDataMock
        );

        const savedTasks = saveDataMock.mock.calls[0][0];
        expect(savedTasks.length).toBe(0);
        expect(state.value.length).toBe(0)
    });

    it('correctly removes multiple tasks', () => {
        const saveDataMock = vi.fn();
        const state = JSON.parse(JSON.stringify(mockTaskListState));
        const secondTestTask = { ...testTask, creationTime: testTask.creationTime + 1 };
        state.value = [testTask, secondTestTask];

        removeTasksReducer(
            state,
            { payload: [testTask, secondTestTask], type: 'removeTasks' },
            saveDataMock
        );

        const savedTasks = saveDataMock.mock.calls[0][0];
        expect(savedTasks.length).toBe(0);
        expect(state.value.length).toBe(0)
    });

    it('restores the removed task when undoing removal', () => {
        const saveDataMock = vi.fn();
        const state = JSON.parse(JSON.stringify(mockTaskListState));
        state.value = [testTask];

        removeTasksReducer(
            state,
            { payload: [testTask], type: 'removeTasks' },
            saveDataMock
        );

        taskListSlice.caseReducers.undoTaskListChange(state)

        expect(state.value).toHaveLength(1);
        expect(state.value[0]).toEqual(testTask);
    })
});