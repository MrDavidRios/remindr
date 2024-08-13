import angelRightIcon from '@assets/icons/angel-right.svg';
import checkboxCheckedIcon from '@assets/icons/checkbox-checked.svg';
import checkboxEmptyIcon from '@assets/icons/checkbox-empty.svg';
import subtasksIcon from '@assets/icons/subtasks.svg';
import { Subtask } from '@remindr/shared';
import { collapseButtonAnimationProps } from '@renderer/animation';
import { useAppSelector } from '@renderer/hooks';
import { isCmdorCtrlPressed } from '@renderer/scripts/systems/hotkeys';
import { motion } from 'framer-motion';
import type { FC, RefObject } from 'react';
import { createRef, useEffect, useRef, useState } from 'react';
import DynamicInput from '../../dynamic-text-area/DynamicInput';

interface SubtaskEditorProps {
  subtasks: Subtask[];
  onChange: (subtasks: Subtask[]) => void;
}

export const SubtaskEditor: FC<SubtaskEditorProps> = ({ subtasks, onChange }) => {
  const modifiedSubtasks = JSON.parse(JSON.stringify(subtasks)) as Subtask[];
  const finalInputRef = useRef<HTMLInputElement>(null);

  const animationsEnabled = useAppSelector((state) => state.settings.value.enableAnimations);

  const [updateFocus, setUpdateFocus] = useState(false);
  const [focusIdx, setFocusIdx] = useState(-1);

  const inputRefs = useRef<RefObject<HTMLTextAreaElement>[]>([]);
  inputRefs.current = modifiedSubtasks.map((_, i) => inputRefs.current[i] ?? createRef());

  const [hoveringOverHeader, setHoveringOverHeader] = useState(false);
  const [collapsed, setCollapsed] = useState(window.store.get('subtasksCollapsed') ?? false);

  const completedSubtasks = modifiedSubtasks.filter((subtask) => subtask.complete).length;
  const subtaskProgressClasses = `${subtasks.length === 0 ? 'hidden' : ''} ${
    completedSubtasks === subtasks.length ? 'complete' : ''
  }`;
  const subtaskProgressText = `${completedSubtasks}/${subtasks.length}`;

  useEffect(() => {
    if (!updateFocus) return;

    // If focus idx is set to -1, focus on 'Add a subtask...' input
    if (focusIdx === -1) {
      finalInputRef.current?.focus();
      return;
    }

    inputRefs.current[focusIdx].current?.focus();
    setUpdateFocus(false);
  }, [updateFocus, focusIdx]);

  const focusOnSubtask = (idx: number) => {
    setFocusIdx(idx);
    setUpdateFocus(true);
  };

  const removeSubtask = (idx: number) => {
    modifiedSubtasks.splice(idx, 1);
    onChange(modifiedSubtasks);

    const otherSubtasksExist = modifiedSubtasks.length > 0;
    let nextIdx = idx === 0 ? 0 : idx - 1;
    if (!otherSubtasksExist) {
      nextIdx = -1;
    }

    focusOnSubtask(nextIdx);
  };

  // If subtasks are collapsed, make sure no inputs/checkboxes are tabbable
  inputRefs.current.forEach((ref) => {
    if (!ref.current) return;

    ref.current.tabIndex = collapsed ? -1 : 0;
  });

  return (
    <div id="subtasksWrapper">
      <button
        id="subtasksHeader"
        onFocus={() => setHoveringOverHeader(true)}
        onBlur={() => setHoveringOverHeader(false)}
        onMouseEnter={() => setHoveringOverHeader(true)}
        onMouseLeave={() => setHoveringOverHeader(false)}
        type="button"
        onClick={() => {
          window.store.set('subtasksCollapsed', !collapsed);
          setCollapsed(!collapsed);
        }}
      >
        <img src={subtasksIcon} draggable="false" alt="" />
        <h4>Subtasks</h4>
        <p className={subtaskProgressClasses} title={`${subtaskProgressText} subtasks completed`}>
          {subtaskProgressText}
        </p>
        {/* Show collapsed button if hovering over header or if collapsed */}
        {(hoveringOverHeader || collapsed) && (
          <motion.img
            src={angelRightIcon}
            draggable={false}
            className="collapse-img"
            alt={`${collapsed ? 'Show' : 'Hide'} subtasks`}
            {...collapseButtonAnimationProps(animationsEnabled, collapsed)}
          />
        )}
      </button>
      <div id="subtasksList" className={collapsed ? 'collapsed' : ''}>
        {subtasks.map((subtask, idx) => (
          <div key={subtask.id}>
            <button
              type="button"
              onClick={() => {
                modifiedSubtasks[idx].complete = !modifiedSubtasks[idx].complete;
                onChange(modifiedSubtasks);
              }}
              tabIndex={collapsed ? -1 : 0}
            >
              <img
                src={subtask.complete ? checkboxCheckedIcon : checkboxEmptyIcon}
                draggable="false"
                alt={`Mark subtask as ${subtask.complete ? 'incomplete' : 'complete'}`}
              />
            </button>

            <DynamicInput
              ref={inputRefs.current[idx]}
              {...subtaskInputProps()}
              value={subtask.name}
              onChange={(e) => {
                modifiedSubtasks[idx].name = e.currentTarget.value;
                onChange(modifiedSubtasks);
              }}
              onKeyDown={(e) => {
                if (e.key === 'ArrowUp' && e.altKey && idx > 0) {
                  // move subtask up in array
                  const updatedSubtasks = [...modifiedSubtasks];
                  const subtaskToRelocate = updatedSubtasks.splice(idx, 1)[0];
                  updatedSubtasks.splice(idx - 1, 0, subtaskToRelocate);

                  onChange(updatedSubtasks);
                  focusOnSubtask(idx - 1);
                }

                if (e.key === 'ArrowDown' && e.altKey && idx < modifiedSubtasks.length - 1) {
                  // move subtask up in array
                  const updatedSubtasks = [...modifiedSubtasks];
                  const subtaskToRelocate = updatedSubtasks.splice(idx, 1)[0];
                  updatedSubtasks.splice(idx + 1, 0, subtaskToRelocate);

                  onChange(updatedSubtasks);
                  focusOnSubtask(idx + 1);
                }

                if (e.key === 'Enter') {
                  e.preventDefault();

                  // Cmd/Ctrl + Enter: Create new subtask under current
                  if (isCmdorCtrlPressed(e)) {
                    // If subtask name is currently empty, don't do anything
                    if (e.currentTarget.value.trim() === '') return;

                    const newSubtask = new Subtask('');
                    modifiedSubtasks.splice(idx + 1, 0, newSubtask);

                    onChange(modifiedSubtasks);
                    focusOnSubtask(idx + 1);
                    return;
                  }

                  const nextInput = inputRefs.current[idx + 1]?.current;
                  if (!nextInput) {
                    finalInputRef.current?.focus();
                    return;
                  }

                  nextInput.focus();
                  return;
                }

                // Cmd/Ctrl + x: Cut current subtask
                if (e.key.toLowerCase() === 'x' && isCmdorCtrlPressed(e)) {
                  e.preventDefault();

                  navigator.clipboard.writeText(e.currentTarget.value);
                  removeSubtask(idx);
                  return;
                }

                if (e.key === 'Backspace' && e.currentTarget.value === '') {
                  e.preventDefault();
                  removeSubtask(idx);
                }
              }}
              onBlur={(e) => {
                if (e.currentTarget.value.trim() === '') {
                  removeSubtask(idx);
                }
              }}
              onNavigateUp={() => {
                if (idx === 0) return;
                focusOnSubtask(idx - 1);
              }}
              onNavigateDown={() => {
                if (idx === modifiedSubtasks.length - 1) {
                  finalInputRef.current?.focus();
                  return;
                }

                focusOnSubtask(idx + 1);
              }}
            />
          </div>
        ))}
        <div>
          <button type="button" tabIndex={-1}>
            <img src={checkboxEmptyIcon} draggable="false" alt="Placeholder subtask checkbox" />
          </button>
          <input
            {...subtaskInputProps()}
            tabIndex={collapsed ? -1 : 0}
            placeholder="Add a subtask..."
            ref={finalInputRef}
            onChange={(e) => {
              if (e.currentTarget.value.trim() === '') {
                return;
              }

              const newSubtask = new Subtask(e.currentTarget.value);
              modifiedSubtasks.push(newSubtask);
              onChange(modifiedSubtasks);

              e.currentTarget.value = '';

              focusOnSubtask(modifiedSubtasks.length - 1);
            }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowUp') {
                e.preventDefault();
                focusOnSubtask(modifiedSubtasks.length - 1);
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

function subtaskInputProps() {
  return {
    type: 'text',
    className: 'subtask-input',
    maxLength: 255,
  };
}
