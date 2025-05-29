import log from "electron-log";

/**
 *  This function must be paired with a return statement to indicate an early exit.
 */
export function throwError(message: string) {
  log.error(message);
  throw new Error(message);
}
