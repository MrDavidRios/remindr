import { generateUniqueID } from 'main/utils/idutils';

export enum LinkType {
  Webpage = 'webpage',
  File = 'file',
  Obsidian = 'obsidian',
}

export type Link = {
  url: string;
  title: string;
  type: LinkType;
  faviconURL: string;
  id: number;
};

export const linkTypeLabels = ['Webpage', 'File', 'Obsidian Note'];

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

  switch (type) {
    case LinkType.File:
      return window.electron.path.basename(url);
    case LinkType.Webpage:
      // Removes protocol (http:, https:, ftp:, etc.) from url
      const trimmedURL = url.replace(/(^\w+:|^)\/\//, '').replace(/^www\./, '');
      return trimmedURL;
  }

  return url;
};

export const openLink = (link: Link) => {
  switch (link.type) {
    case LinkType.File:
    case LinkType.Obsidian:
      window.electron.shell.openExternal(link.url);
      break;

    case LinkType.Webpage:
      // check if url has http in it
      const openableURL = getOpenableURL(link.url);
      window.electron.shell.openExternal(openableURL);
      break;
  }
};

export const getOpenableURL = (url: string) => {
  const hasHttp = url.includes('http://') || url.includes('https://');
  const openableURL = hasHttp ? url : `http://${url}`;

  return openableURL;
};
