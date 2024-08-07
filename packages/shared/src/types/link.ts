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

export const getOpenableURL = (url: string) => {
  const hasHttp = url.includes('http://') || url.includes('https://');
  const openableURL = hasHttp ? url : `http://${url}`;

  return openableURL;
};
