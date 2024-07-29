import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);
root.render(
  <StrictMode>
    {/* <Provider store={store}> */}
    <p>Hey!</p>
    {/* </Provider> */}
  </StrictMode>,
);
