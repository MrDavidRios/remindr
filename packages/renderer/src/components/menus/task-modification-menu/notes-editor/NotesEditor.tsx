import { useAppSelector } from '@renderer/hooks';
import React, { FC, useEffect } from 'react';

interface NotesEditorProps extends React.HTMLProps<HTMLTextAreaElement> {}

export const NotesEditor: FC<NotesEditorProps> = (props: NotesEditorProps) => {
  const { id, className, placeholder, maxLength, onChange, value } = props;

  const spellCheckEnabled = useAppSelector((state) => state.settings.value.spellcheck);

  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!textareaRef.current) return;
    resizeTextArea(textareaRef.current);
  }, [value]);

  return (
    <textarea
      ref={textareaRef}
      spellCheck={spellCheckEnabled}
      value={value}
      style={{ minHeight: '100px' }}
      onChange={onChange}
      onBlur={(e) => {
        if (!onChange || !textareaRef.current) return;

        textareaRef.current.value = cleanupText(e.currentTarget.value);
        onChange(e);
      }}
      id={id}
      className={className}
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
  textarea.style.height = `${textarea.scrollHeight}px`;
}
