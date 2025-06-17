import { createDefaultSettings, Menu } from "@remindr/shared";
import { RootState } from "../../src/app/store";
import { renderWithProviders } from "./store-utils";
import { mockMenuState, mockTaskListState, testTask } from "./testObjs";

interface RenderWhileEditingTaskOptions {
  children: React.ReactNode;
  openMenus?: Menu[];
  // stateOverrides?: Partial<RootState>;
  taskModificationStateOverrides?: Partial<RootState["taskModificationState"]>;
}

export const renderWhileEditingTask = ({
  children,
  openMenus = [],
  // stateOverrides = {},
  taskModificationStateOverrides = {},
}: RenderWhileEditingTaskOptions) => {
  const editedTask = { ...testTask, name: "Edited Task" };

  const state: Partial<RootState> = {
    // ...stateOverrides,
    menuState: { ...mockMenuState, openMenus },
    taskList: mockTaskListState,
    taskModificationState: {
      taskEditState: { originalTask: testTask, editedTask: editedTask },
      taskCreationState: { originalTask: testTask, editedTask: editedTask },
      reminderEditState: { idx: 0, state: "edit" },
      linkEditState: { idx: 0, state: "edit" },
      lastEditType: "edit",
      ...taskModificationStateOverrides,
    },
    settings: { value: createDefaultSettings(), syncOnline: false },
  };

  renderWithProviders(children, undefined, state);
};
