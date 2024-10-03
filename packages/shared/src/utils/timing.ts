export function delay(ms: number): Promise<void> {
  // eslint-disable-next-line no-promise-executor-return
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const waitUntil = (condition: any, checkInterval = 100) => {
  return new Promise((resolve) => {
    const interval = setInterval(() => {
      if (!condition()) return;
      clearInterval(interval);
      resolve(true);
    }, checkInterval);
  });
};
