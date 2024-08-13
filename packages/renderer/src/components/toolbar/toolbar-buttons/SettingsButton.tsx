import settingsGearIcon from '@assets/icons/settings-gear.svg';
import { Menu } from '@remindr/shared';
import { showMenu } from '@renderer/features/menu-state/menuSlice';
import { useAppDispatch } from '@renderer/hooks';
import { useAnimationsEnabled } from '@renderer/scripts/utils/hooks/useanimationsenabled';
import { motion } from 'framer-motion';
import { useState } from 'react';

export const SettingsButton: React.FC = () => {
  const dispatch = useAppDispatch();
  const animate = useAnimationsEnabled();

  const [hovered, setHovered] = useState(false);

  return (
    <button
      type="button"
      id="settingsButton"
      className="toolbar-button"
      style={{ gridRow: 5 }}
      title="Settings (Ctrl + ,)"
      onClick={() => dispatch(showMenu(Menu.SettingsMenu))}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="toolbar-button-img-container">
        <motion.img
          src={settingsGearIcon}
          className="small"
          draggable="false"
          animate={{
            transform: hovered && animate ? 'rotate(45deg)' : 'rotate(0deg)',
          }}
        />
      </div>
    </button>
  );
};
