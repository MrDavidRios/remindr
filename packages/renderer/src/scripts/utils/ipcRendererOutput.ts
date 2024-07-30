/**
 * Gets ipc render event arguments sent from both main (object itself) and renderer (passed as arg array)
 * @param e
 * @returns
 */
export function getIpcRendererOutput(e: any): any {
  if (e[0] !== undefined) return e[0];

  return e;
}
