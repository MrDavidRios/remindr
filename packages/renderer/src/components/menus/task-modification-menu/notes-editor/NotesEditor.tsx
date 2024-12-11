import { Menu } from '@remindr/shared';
import { useAppSelector } from '@renderer/hooks';
import { useHotkey } from '@renderer/scripts/utils/hooks/usehotkey';
import { FC, useEffect, useRef, useState } from 'react';

interface NotesEditorProps extends React.HTMLProps<HTMLTextAreaElement> {
  taskId: number;
  onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
  onSave?: (value: React.HTMLProps<HTMLTextAreaElement>['value']) => void;
  saveOnChange?: boolean;
}

export const NotesEditor: FC<NotesEditorProps> = (props: NotesEditorProps) => {
  const { id, className, placeholder, maxLength, onSave, defaultValue, saveOnChange, taskId } = props;

  const spellCheckEnabled = useAppSelector((state) => state.settings.value.spellcheck);
  const [value, setValue] = useState(defaultValue);
  const [showButtons, setShowButtons] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!textareaRef.current) return;
    resizeTextArea(textareaRef.current);
  }, [value]);

  useEffect(() => {
    setValue(defaultValue);
    setShowButtons(false);
  }, [taskId]);

  const save = () => {
    const trimmedNotes = cleanupText(value);
    onSave?.(trimmedNotes);

    setShowButtons(false);
  };

  const cancel = () => {
    setValue(defaultValue);
    setShowButtons(false);
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
      cancel();

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
          if (e.currentTarget.value !== defaultValue) setShowButtons(true);

          setValue(e.currentTarget.value);

          if (saveOnChange) save();
        }}
        id={id}
        className={className}
        placeholder={placeholder}
        maxLength={maxLength}
      />
      {!saveOnChange && showButtons && (
        <div className="notes-editor-buttons">
          <button className="accent-button" onClick={save}>
            Save
          </button>
          <button className="secondary-button" onClick={cancel}>
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
