import profilePlaceholderIcon from '@assets/icons/profile-placeholder.svg';
import { Menu } from '@remindr/shared';
import { showMenu } from '/@/features/menu-state/menuSlice';
import { useAppDispatch } from '/@/hooks';

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
