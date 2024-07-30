/**
 * Gets the name of an Obsidian note from an Obsidian URL.
 * @param url The Obsidian URL
 */
export function getObsidianNoteName(url: string): string | undefined {
  // Create a URL object from the url string
  const urlObj = new URL(url);

  // Get the 'file' query parameter
  const fileParam = urlObj.searchParams.get('file');
  if (!fileParam) return undefined;

  // Decode the file parameter to get the note name
  const notePath = decodeURIComponent(fileParam);
  const noteName = notePath.split('/').pop();

  return noteName;
}

export function isObsidianURL(url: string): boolean {
  return url.startsWith('obsidian://');
}

export function getFaviconURL(url: string): string {
  const urlObj = new URL(url);
  const faviconURL = `https://s2.googleusercontent.com/s2/favicons?domain=${urlObj.hostname}`;
  return faviconURL;
}
