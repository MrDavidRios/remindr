export const escEvent = (e: React.KeyboardEvent, callback: () => void) => {
  if (e.key === 'Escape') {
    callback();
  }
};
