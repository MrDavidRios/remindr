import { useAppSelector } from '@renderer/hooks';
import React, { useEffect } from 'react';

interface DynamicTextAreaProps extends React.HTMLProps<HTMLTextAreaElement> {
  value: string;
  allowNewLine?: boolean;
}

export const DynamicTextArea: React.FC<DynamicTextAreaProps> = (props) => {
  const {
    id,
    'aria-label': ariaLabel,
    placeholder,
    maxLength,
    value,
    autoFocus,
    onChange,
    allowNewLine = true,
  } = props;

  const spellCheckEnabled = useAppSelector((state) => state.settings.value.spellcheck);

  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!textareaRef.current) return;
    resizeTextArea(textareaRef.current);
  }, [value, autoFocus]);

  useEffect(() => {
    if (!textareaRef.current) return;

    if (autoFocus) {
      textareaRef.current.selectionStart = textareaRef.current.value.length;
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  return (
    <textarea
      ref={textareaRef}
      id={id}
      aria-label={ariaLabel}
      spellCheck={spellCheckEnabled}
      value={value}
      className="dynamic-text-area"
      onChange={(e) => {
        if (!onChange) return;

        if (!allowNewLine) {
          e.currentTarget.value = e.currentTarget.value.replace(/\n/g, '');
        }

        onChange(e);
      }}
      autoFocus={autoFocus}
      onBlur={(e) => {
        if (!onChange || !textareaRef.current) return;

        textareaRef.current.value = cleanupText(e.currentTarget.value);
        onChange(e);
      }}
      placeholder={placeholder}
      maxLength={maxLength}
    />
  );
};

function cleanupText(text: string): string {
  return text.trim();
}

function resizeTextArea(textarea: HTMLTextAreaElement) {
  textarea.style.height = '5px';
  textarea.style.minHeight = '5px';

  textarea.style.height = `${textarea.scrollHeight}px`;
  textarea.style.minHeight = `${textarea.scrollHeight}px`;
}
