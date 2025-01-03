import { Menu } from '@remindr/shared';
import { setDialogResult } from '@renderer/features/menu-state/menuSlice';
import { useAppDispatch, useAppSelector } from '@renderer/hooks';
import { FC } from 'react';
import { FullScreenMenu } from '../menus/fullscreen-menu/FullScreenMenu';
import { DismissButton } from './DismissButton';

const primaryOptions = ['continue', 'delete'];

export const MessageModal: FC = () => {
  const dispatch = useAppDispatch();
  const { title, message, options } = useAppSelector((state) => state.menuState.dialogInfo);

  return (
    <FullScreenMenu menuType={Menu.MessageModal} className="menu with-title" id="messageModal">
      <div>
        {title && <h3>{title}</h3>}
        <p>{message}</p>
      </div>
      {(options ?? []).length > 0 ? (
        <div className="action-buttons">
          {options?.map((option) => {
            const lowercasedOption = option.toLowerCase();
            const buttonClasses = `${primaryOptions.includes(lowercasedOption) ? 'primary-button' : 'secondary'}`;

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
        <DismissButton />
      )}
    </FullScreenMenu>
  );
};
