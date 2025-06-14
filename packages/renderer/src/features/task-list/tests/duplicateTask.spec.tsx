import { setupTestStore } from '@mocks/store-utils';
import { mockTaskListState, testTask } from '@mocks/testObjs';
import store from '@renderer/app/store';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { duplicateTasksReducer } from '../basicTaskListOperations';
import { taskListSlice } from '../taskListSlice';

describe('Duplicate Task Reducer', () => {
    beforeEach(() => {
        const mockedStore = setupTestStore({
            taskList: {
                ...mockTaskListState,
                taskListGetStatus: 'succeeded',
            },
        });

        vi.mocked(store.getState).mockReturnValue(mockedStore.getState());
    });

    it('correctly duplicates a single task', () => {
        const saveDataMock = vi.fn();
        const state = JSON.parse(JSON.stringify(mockTaskListState));
        state.value = [testTask];

        duplicateTasksReducer(
            state,
            { payload: [testTask], type: 'duplicateTasks' },
            saveDataMock
        );

        const savedTasks = saveDataMock.mock.calls[0][0];
        expect(savedTasks[0]).toEqual(testTask);
        expect(savedTasks[1]).toMatchObject({
            ...testTask,
            creationTime: expect.any(Number),
        });
        expect(savedTasks[1]).not.toBe(testTask); // Not the same reference
        expect(savedTasks[1].creationTime).not.toBe(testTask.creationTime);
    });

    it('correctly duplicates multiple tasks', () => {
        const saveDataMock = vi.fn();
        const state = JSON.parse(JSON.stringify(mockTaskListState));
        const secondTestTask = { ...testTask, creationTime: testTask.creationTime + 1 };
        state.value = [testTask, secondTestTask];

        duplicateTasksReducer(
            state,
            { payload: [testTask, secondTestTask], type: 'duplicateTasks' },
            saveDataMock
        );

        const savedTasks = saveDataMock.mock.calls[0][0];
        expect(savedTasks[0]).toEqual(testTask);
        expect(savedTasks[1]).toEqual(secondTestTask);

        expect(savedTasks[2]).toMatchObject({
            ...testTask,
            creationTime: expect.any(Number),
        });
        expect(savedTasks[2]).toMatchObject({
            ...secondTestTask,
            creationTime: expect.any(Number),
        });
    });

    it('removes the duplicated task when undoing duplication', () => {
        const saveDataMock = vi.fn();
        const state = JSON.parse(JSON.stringify(mockTaskListState));
        state.value = [testTask];

        duplicateTasksReducer(
            state,
            { payload: [testTask], type: 'duplicateTasks' },
            saveDataMock
        );

        taskListSlice.caseReducers.undoTaskListChange(state)

        expect(state.value).toHaveLength(1);
        expect(state.value[0]).toEqual(testTask);
    })
});