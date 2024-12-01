import type { RefObject } from 'react';
import { useEffect, useRef } from 'react';

const globalExceptions = ['.backdrop', '.full-window-container'];

const elementsContainTarget = (elements: Element[], target: EventTarget | null) => {
  return elements.some((element) => element.contains(target as Node));
};

// Click outside hook
/**
 *
 * @param callback
 * @param exceptions an array of queries to exclude from the click outside event
 * @returns
 */
export function useClickOutside(
  callback: () => void,
  exceptions: string[] = [],
  ignoreGlobalExceptions?: boolean,
): RefObject<HTMLElement> {
  const domNodeRef = useRef() as RefObject<HTMLElement>;

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      // If the ref element contains the clicked element, ignore the click event
      if (domNodeRef.current?.contains(event.target as Node)) return;

      // If the clicked element is an exception, ignore the click event
      const allExceptions = ignoreGlobalExceptions ? exceptions : [...globalExceptions, ...exceptions];

      if (
        allExceptions?.some((query) =>
          elementsContainTarget(Array.from(document.querySelectorAll(query)), event.target),
        )
      )
        return;

      callback();
    };

    document.addEventListener('mousedown', handler);

    return () => {
      document.removeEventListener('mousedown', handler);
    };
  }, []);

  return domNodeRef as RefObject<HTMLElement>;
}
