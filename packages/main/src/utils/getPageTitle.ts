import axios from 'axios';

// eslint-disable-next-line import/newline-after-import
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

export async function getPageTitle(url: string): Promise<string> {
  const response = await axios.get(url);
  const dom = new JSDOM(response.data);
  return dom.window.document.title;
}
