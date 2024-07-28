export const waitUntil = (condition: any, checkInterval = 100) => {
  return new Promise((resolve) => {
    const interval = setInterval(() => {
      if (!condition()) return;
      clearInterval(interval);
      resolve(true);
    }, checkInterval);
  });
};
