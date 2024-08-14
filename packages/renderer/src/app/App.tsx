import { useEffect } from 'react';
import { HotkeysProvider, useHotkeys } from 'react-hotkeys-hook';
import { Route, MemoryRouter as Router, Routes } from 'react-router-dom';
import '../../styles/css/main.css';
import { Background } from '../components/background/Background';
import Titlebar from '../components/titlebar/Titlebar';
import { useAppDispatch } from '../hooks';
import { DisplayMenus } from '../menuLogic';
import { ChosenPage } from '../pageLogic';
import { useStartupActions } from '../startup';

function Root() {
  const dispatch = useAppDispatch();

  // Initialization Steps
  useEffect(() => useStartupActions(dispatch), []);

  // Initialize Hotkeys
  useHotkeys('mod+w', () => {
    window.mainWindow.hide();
  });

  useHotkeys('mod+q', () => {
    window.electron.ipcRenderer.sendMessage('action-on-save', 'quit');
  });

  useHotkeys('mod+r', () => {
    window.electron.ipcRenderer.sendMessage('action-on-save', 'restart');
  });

  useHotkeys('mod+shift+i', () => {
    window.mainWindow.openDevTools();
  });

  return (
    <div id="appWrapper">
      <HotkeysProvider>
        <Background />

        {/* div is put before Titlebar in DOM so that Titlebar is higher in the stacking order */}
        <div style={{ gridRow: 2 }}>
          {/* Chooses page to display */}
          <ChosenPage />

          {/* Contains floating menus */}
          <DisplayMenus />
        </div>
        <Titlebar />
      </HotkeysProvider>
    </div>
  );
}

export function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Root />} />
      </Routes>
    </Router>
  );
}
