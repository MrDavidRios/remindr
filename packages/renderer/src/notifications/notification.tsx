import { createRoot } from 'react-dom/client';
import { NotificationWindow } from './NotificationWindow';

const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);
root.render(NotificationWindow());
