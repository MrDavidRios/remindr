import { useAppSelector } from '@renderer/hooks';
import type { RefObject } from 'react';
import React, { createRef, useEffect, useMemo } from 'react';

interface DynamicInputProps extends React.HTMLProps<HTMLTextAreaElement> {
  value: string;
  /**
   * Fired when the user presses the up arrow key and caret is at beginning of input.
   */
  onNavigateUp?: () => void;
  /**
   * Fired when the user presses the down arrow key and caret is at end of input.
   */
  onNavigateDown?: () => void;
}

export default React.forwardRef<HTMLTextAreaElement, DynamicInputProps>((props, ref) => {
  const {
    id,
    className,
    placeholder,
    maxLength,
    value,
    onChange,
    onBlur,
    onKeyDown,
    onNavigateUp,
    onNavigateDown,
    autoFocus,
  } = props;

  const spellCheckEnabled = useAppSelector((state) => state.settings.value.spellcheck);

  // If no ref is passed in, create one
  const inputRef: RefObject<HTMLTextAreaElement> = useMemo(
    () => (ref as unknown as RefObject<HTMLTextAreaElement>) || createRef(),
    [ref],
  );

  useEffect(() => {
    if (!inputRef.current) return;
    resizeInput(inputRef.current);
  }, [value]);

  useEffect(() => {
    if (!inputRef.current) return;

    // Make sure focus is at the end of the input - not the beginning - when first rendering
    inputRef.current.selectionStart = inputRef.current.selectionEnd = inputRef.current.value.length;
  }, []);

  return (
    <textarea
      ref={ref}
      id={id}
      className={className}
      spellCheck={spellCheckEnabled}
      value={value}
      autoFocus={autoFocus}
      onChange={(e) => {
        if (!onChange) return;

        // Filter out newlines
        e.currentTarget.value = cleanupText(e.currentTarget.value.replace(/\n/g, ''), false);

        onChange(e);
      }}
      onBlur={(e) => {
        if (!onChange || !inputRef.current) return;

        inputRef.current.value = cleanupText(e.currentTarget.value);
        onChange(e);

        if (onBlur) onBlur(e);
      }}
      onKeyDown={(e) => {
        const caretAtBeginning = e.currentTarget.selectionStart === 0;
        if (e.key === 'ArrowUp' && caretAtBeginning && onNavigateUp) onNavigateUp();

        const caretAtEnd = e.currentTarget.selectionStart === e.currentTarget.value.length;
        if (e.key === 'ArrowDown' && caretAtEnd && onNavigateDown) onNavigateDown();

        if (onKeyDown) onKeyDown(e);
      }}
      placeholder={placeholder}
      maxLength={maxLength}
    />
  );
});

function cleanupText(text: string, trim = true): string {
  const cleanedText = text.replace(/\n/g, '');

  return trim ? cleanedText.trim() : cleanedText;
}

function resizeInput(input: HTMLTextAreaElement) {
  input.style.height = '5px';
  input.style.height = `${input.scrollHeight}px`;
}
