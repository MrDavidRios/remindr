import { Menu } from '@remindr/shared';
import { hideMenu, setDialogResult } from '@renderer/features/menu-state/menuSlice';
import { useAppDispatch, useAppSelector } from '@renderer/hooks';
import { FC } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { FullScreenMenu } from '../menus/fullscreen-menu/FullScreenMenu';

export const MessageModal: FC = () => {
  const dispatch = useAppDispatch();
  const { title, message, options } = useAppSelector((state) => state.menuState.dialogInfo);

  useHotkeys('esc', () => dispatch(hideMenu({ menu: Menu.MessageModal, fromEscKeypress: true })), {
    enableOnFormTags: true,
  });

  return (
    <FullScreenMenu className="menu with-title" id="messageModal">
      <div>
        {title && <h3>{title}</h3>}
        <p>{message}</p>
      </div>
      {(options ?? []).length > 0 ? (
        <div className="action-buttons">
          {options?.map((option) => {
            const lowercasedOption = option.toLowerCase();
            const buttonClasses = `${lowercasedOption !== 'discard' ? 'primary-button' : 'secondary'}`;

            return (
              <button
                className={buttonClasses}
                onClick={() => dispatch(setDialogResult(option))}
                type="button"
                key={option}
              >
                {option}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="dismiss-button-wrapper">
          <button
            className="primary-button"
            onClick={() => dispatch(hideMenu({ menu: Menu.MessageModal }))}
            type="button"
          >
            Dismiss
          </button>
        </div>
      )}
    </FullScreenMenu>
  );
};
