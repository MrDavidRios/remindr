import type { Link } from '@remindr/shared';
import { generateUniqueID, getOpenableURL, LinkType } from '@remindr/shared';

export const getDefaultLink = (): Link => ({
  url: '',
  title: '',
  type: LinkType.Webpage,
  faviconURL: '',
  id: generateUniqueID(),
});

export const getDisplayURL = (link: Link) => {
  const { title, type, url } = link;

  if (link.title.trim().length > 0) return title;

  const trimmedURL = url.replace(/(^\w+:|^)\/\//, '').replace(/^www\./, '');

  switch (type) {
    case LinkType.File:
      return window.electron.path.basename(url);
    case LinkType.Webpage:
      // Removes protocol (http:, https:, ftp:, etc.) from url
      return trimmedURL;
  }

  return url;
};

export const openLink = (link: Link) => {
  const openableURL = getOpenableURL(link.url);

  switch (link.type) {
    case LinkType.File:
    case LinkType.Obsidian:
      window.electron.shell.openExternal(link.url);
      break;

    case LinkType.Webpage:
      // check if url has http in it
      window.electron.shell.openExternal(openableURL);
      break;
  }
};
