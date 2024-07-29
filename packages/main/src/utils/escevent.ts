export const escEvent = (e: KeyboardEvent, callback: () => void) => {
  if (e.key === 'Escape') {
    callback();
  }
};
