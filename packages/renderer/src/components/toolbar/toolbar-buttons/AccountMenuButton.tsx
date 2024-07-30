import { Menu } from 'main/types/menu';
import { showMenu } from 'renderer/features/menu-state/menuSlice';
import { useAppDispatch } from 'renderer/hooks';
import profilePlaceholderIcon from '../../../../../assets/icons/profile-placeholder.svg';

export const AccountMenuButton: React.FC = () => {
  const dispatch = useAppDispatch();

  return (
    <button
      type="button"
      id="accountMenuButton"
      className="toolbar-button"
      style={{ gridRow: 4 }}
      title="Your Account (Ctrl + A)"
      onClick={() => dispatch(showMenu(Menu.AccountMenu))}
    >
      <div className="toolbar-button-img-container">
        <img
          src={profilePlaceholderIcon}
          className="small profile-picture"
          style={{ clipPath: 'circle(15px at center)' }}
          draggable="false"
        />
      </div>
    </button>
  );
};
