import { createRoot } from 'react-dom/client';
import { GroupNotificationWindow } from './GroupNotificationWindow';

const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);
root.render(GroupNotificationWindow());
