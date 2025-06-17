import { renderWhileEditingTask } from "@mocks/renderHelpers";
import { Menu } from "@remindr/shared";
import { cleanup, screen } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";
import { LinkMenu } from "./LinkMenu";

describe("Link Menu", () => {
  afterEach(() => {
    cleanup();
  });

  test("Should show edit link in title if editing link", () => {
    renderWhileEditingTask({
      children: <LinkMenu />,
      openMenus: [Menu.LinkMenu],
    });

    expect(screen.getByText("Edit Link")).toBeTruthy();
  });

  test("Should show add link in title if creating link", () => {
    renderWhileEditingTask({
      children: <LinkMenu />,
      openMenus: [Menu.LinkMenu],
      taskModificationStateOverrides: {
        linkEditState: { idx: 0, state: "create" },
      },
    });

    expect(screen.getByText("Add Link")).toBeTruthy();
  });
});
