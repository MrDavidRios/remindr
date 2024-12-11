import { Menu } from '@remindr/shared';
import { useAppSelector } from '@renderer/hooks';
import { useHotkey } from '@renderer/scripts/utils/hooks/usehotkey';
import React, { FC, useEffect } from 'react';

interface NotesEditorProps extends React.HTMLProps<HTMLTextAreaElement> {
  onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
  onSave?: (value: React.HTMLProps<HTMLTextAreaElement>['value']) => void;
}

export const NotesEditor: FC<NotesEditorProps> = (props: NotesEditorProps) => {
  const { id, className, placeholder, maxLength, onSave, defaultValue } = props;

  const spellCheckEnabled = useAppSelector((state) => state.settings.value.spellcheck);
  const [value, setValue] = React.useState(defaultValue);

  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!textareaRef.current) return;
    resizeTextArea(textareaRef.current);
  }, [value]);

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  const save = () => {
    const trimmedNotes = cleanupText(value);

    onSave?.(trimmedNotes);
  };

  useHotkey(
    ['mod+s'],
    () => {
      save();
    },
    Menu.None,
  );

  useHotkey(
    ['esc'],
    () => {
      const canCancel = value !== defaultValue;
      setValue(defaultValue);

      return canCancel;
    },
    Menu.None,
    { prioritize: true },
  );

  return (
    <>
      <textarea
        ref={textareaRef}
        spellCheck={spellCheckEnabled}
        value={value}
        style={{ minHeight: '100px' }}
        onChange={(e) => {
          setValue(e.currentTarget.value);
        }}
        id={id}
        className={className}
        placeholder={placeholder}
        maxLength={maxLength}
      />
      {value !== defaultValue && (
        <div className="notes-editor-buttons">
          <button
            className="accent-button"
            onClick={() => {
              const trimmedNotes = cleanupText(value);

              onSave?.(trimmedNotes);
            }}
          >
            Save
          </button>
          <button className="secondary-button" onClick={() => setValue(defaultValue)}>
            Cancel
          </button>
        </div>
      )}
    </>
  );
};

function cleanupText(text: React.HTMLProps<HTMLTextAreaElement>['value']) {
  if (typeof text !== 'string') return text;

  return text.trim();
}

function resizeTextArea(textarea: HTMLTextAreaElement) {
  textarea.style.height = '5px';
  textarea.style.height = `${textarea.scrollHeight}px`;
}
