import type { Link } from '../types/link.js';
import { LinkType } from '../types/link.js';
import { generateUniqueID } from '../utils/index.js';

export const getDefaultLink = (): Link => ({
  url: '',
  title: '',
  type: LinkType.Webpage,
  faviconURL: '',
  id: generateUniqueID(),
});
