import axios from 'axios';
import { JSDOM } from 'jsdom';

export async function getPageTitle(url: string): Promise<string> {
  const response = await axios.get(url);
  const dom = new JSDOM(response.data);
  return dom.window.document.title;
}
