import { waitUntil } from "@remindr/shared";
import type { LegacyRef } from "react";
import React, { useEffect, useRef } from "react";

interface ArrowNavigableProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  autoFocus?: boolean;
  query?: string;
  id?: string;
  className?: string;
  waitForChildAnimation?: boolean;
  disableCleanup?: boolean;
  disableNavigation?: boolean;
  disableKeyboardClick?: boolean;
  asUl?: boolean;
  initialFocusIdx?: number;
  leftRightNavigation?: boolean;
  style?: React.CSSProperties;
}

export const ArrowNavigable: React.FC<ArrowNavigableProps> = ({
  children,
  autoFocus = false,
  query,
  id,
  className,
  waitForChildAnimation,
  disableCleanup = false,
  disableNavigation = false,
  disableKeyboardClick = false,
  asUl = false,
  initialFocusIdx = 0,
  leftRightNavigation = false,
  style,
}) => {
  const ref = React.useRef<HTMLElement>(null);

  // AbortController manages the child keydown event listeners (helps cleanup when children are rerendered)
  const controller = new AbortController();
  const { signal } = controller;

  const lastFocusedIdx = useRef(initialFocusIdx);
  const [waitingForChildAnimation, setWaitingForChildAnimation] =
    React.useState(waitForChildAnimation);

  function setFocusOnMenuItem(idx: number) {
    const itemsToNavigate = getItemsToNavigate(ref.current, query);

    if (!itemsToNavigate || itemsToNavigate?.length === 0) return;

    const item = itemsToNavigate[idx] as HTMLElement;

    const lastFocusedItem = itemsToNavigate[
      lastFocusedIdx.current
    ] as HTMLElement;
    if (lastFocusedItem) lastFocusedItem.tabIndex = 0;

    lastFocusedIdx.current = idx;
    item.tabIndex = 0;

    item.focus();
  }

  // If the amount of children change, reset focused idx to 0 -> makes sure that the first item is focused when the
  // user returns to the component
  useEffect(() => {
    lastFocusedIdx.current = 0;
  }, [children]);

  useEffect(() => {
    const initializeArrowNavigable = async () => {
      await waitForNavigableItems(ref.current, query);

      if (waitForChildAnimation) setWaitingForChildAnimation(false);

      const itemsToNavigate = getItemsToNavigate(ref.current, query);
      if (!itemsToNavigate || itemsToNavigate.length === 0) return;

      for (let i = 0; i < itemsToNavigate.length; i++) {
        const menuItem = itemsToNavigate[i] as HTMLElement;

        // Makes sure that only the last focused item is tabbable (if the user navigates away, this element serves as an
        // anchor. If the user navigates to another component, its tabindex is set to -1 anyway)
        if (i !== lastFocusedIdx.current) menuItem.tabIndex = -1;

        menuItem.addEventListener(
          "keydown",
          (e: KeyboardEvent) =>
            keydownEventListener(
              e,
              i,
              itemsToNavigate,
              setFocusOnMenuItem,
              disableNavigation,
              disableKeyboardClick,
              leftRightNavigation
            ),
          { signal }
        );
      }

      if (lastFocusedIdx.current !== 0) return;

      if (autoFocus) setFocusOnMenuItem(initialFocusIdx);
      else (itemsToNavigate[initialFocusIdx] as HTMLElement).tabIndex = 0;
    };

    initializeArrowNavigable();

    // Clean up keydown event listeners
    return () => {
      if (disableCleanup) return;

      controller.abort();
    };
  }, [children, waitingForChildAnimation]);

  useEffect(() => {
    const updateOnChildAnimationStateChange = async () => {
      if (!ref.current || !waitForChildAnimation || !query) return;

      const queryWithOnlyAnimating = query.replace(
        ":not(.animating)",
        ".animating"
      );
      const animatingElements = ref.current.querySelectorAll(
        queryWithOnlyAnimating
      );

      if (animatingElements?.length === 0)
        await waitUntil(() => {
          if (!ref.current) return true;

          return (
            ref.current.querySelectorAll(queryWithOnlyAnimating).length > 0
          );
        });

      if (!ref.current) return;

      await waitUntil(() => {
        if (!ref.current) return true;

        const updatedAnimatingElements = ref.current.querySelectorAll(
          queryWithOnlyAnimating
        );
        return (
          (updatedAnimatingElements.length ?? 0) !==
          (animatingElements?.length ?? 0)
        );
      });

      if (!ref.current) return;

      setWaitingForChildAnimation(true);
    };

    updateOnChildAnimationStateChange();
  }, [children]);

  return asUl ? (
    <ul
      ref={ref as unknown as LegacyRef<HTMLUListElement> | undefined}
      id={id}
      className={className}
      style={{ width: "100%", height: "100%", ...style }}
    >
      {children}
    </ul>
  ) : (
    <div
      ref={ref as unknown as LegacyRef<HTMLDivElement> | undefined}
      id={id}
      className={className}
      style={{ width: "100%", height: "100%", ...style }}
    >
      {children}
    </div>
  );
};

const keydownEventListener = (
  e: KeyboardEvent,
  i: number,
  itemsToNavigate: HTMLCollection | NodeList,
  setFocusOnMenuItem: (idx: number) => void,
  disableNavigation: boolean,
  disableKeyboardClick: boolean,
  leftRightNavigation = false
) => {
  const menuItem = itemsToNavigate[i] as HTMLElement;

  let idxToFocusOn = 0;
  const lastElementIdx = itemsToNavigate.length - 1;

  if (disableNavigation) return;

  const activeElementIsInput =
    document.activeElement?.tagName === "INPUT" ||
    document.activeElement?.tagName === "TEXTAREA";
  if (activeElementIsInput) return;

  if ((e.key === "ArrowLeft" || e.key === "ArrowRight") && !leftRightNavigation)
    return;

  switch (e.key) {
    case "ArrowRight":
    case "ArrowDown":
      e.preventDefault();
      e.stopPropagation();

      idxToFocusOn = i === lastElementIdx ? 0 : i + 1;

      setFocusOnMenuItem(idxToFocusOn);
      break;
    case "ArrowLeft":
    case "ArrowUp":
      e.preventDefault();
      e.stopPropagation();
      idxToFocusOn = i === 0 ? lastElementIdx : i - 1;
      setFocusOnMenuItem(idxToFocusOn);
      break;
    case " ":
    case "Enter":
      e.preventDefault();

      if (disableKeyboardClick) break;

      menuItem.click();
      break;
  }
};

const waitForNavigableItems = async (
  element: HTMLSpanElement | null,
  query?: string
) => {
  await waitUntil(() => {
    const itemsToNavigate = getItemsToNavigate(element, query);
    if (!itemsToNavigate) return false;
    return itemsToNavigate.length > 0;
  });
};

function getItemsToNavigate(
  parent: HTMLSpanElement | null,
  query?: string
): HTMLCollection | NodeList | undefined {
  if (!query) return parent?.children;

  return parent?.querySelectorAll(query);
}
