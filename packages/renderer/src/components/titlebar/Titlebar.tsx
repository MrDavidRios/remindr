import { useEffect, useState } from 'react';
import { HamburgerMenu } from './hamburger-menu/HamburgerMenu';
import { mapIconsToSrcSet, titlebarIcons } from './titlebarIcons';

export default function Titlebar() {
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    const setIsMaximizedToTrue = () => setIsMaximized(true);
    const setIsMaximizedToFalse = () => setIsMaximized(false);

    const removeWindowMaximizedListener = window.electron.ipcRenderer.on('window-maximized', setIsMaximizedToTrue);
    const removeWindowUnmaximizedListener = window.electron.ipcRenderer.on('window-unmaximized', setIsMaximizedToFalse);

    return () => {
      removeWindowMaximizedListener();
      removeWindowUnmaximizedListener();
    };
  }, []);

  return (
    <header id="titlebar" className="frosted">
      <HamburgerMenu />
      <div id="drag-region">
        <div id="window-title">
          <span id="window-title-text">Remindr</span>
        </div>
      </div>

      {/* <!-- Window Controls (Minimize, Maximize/Restore, Close) --> */}
      <div id="window-controls">
        <div className="button" id="min-button" onClick={() => window.mainWindow.minimize()} title="Minimize">
          <img className="icon" srcSet={mapIconsToSrcSet(titlebarIcons.min)} alt="Minimize window" draggable="false" />
        </div>

        {isMaximized ? (
          <div className="button" id="restore-button" onClick={() => window.mainWindow.unmaximize()} title="Restore">
            <img
              className="icon"
              srcSet={mapIconsToSrcSet(titlebarIcons.restore)}
              draggable="false"
              alt="Restore window"
            />
          </div>
        ) : (
          <div className="button" id="max-button" onClick={() => window.mainWindow.maximize()} title="Maximize">
            <img
              className="icon"
              srcSet={mapIconsToSrcSet(titlebarIcons.max)}
              draggable="false"
              alt="Maximize window"
            />
          </div>
        )}

        <div className="button" id="close-button" onClick={() => window.mainWindow.hide()} title="Close">
          <img className="icon" srcSet={mapIconsToSrcSet(titlebarIcons.close)} draggable="false" alt="Close window" />
        </div>
      </div>
    </header>
  );
}
