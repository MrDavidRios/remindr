import { fileURLToPath, URL } from 'url';

export function resolveHtmlPath(htmlFileName: string) {
  if (process.env.NODE_ENV === 'development') {
    const port = process.env.PORT || 1212;
    const url = new URL(`http://localhost:${port}`);
    url.pathname = htmlFileName;
    return url.href;
  }

  return fileURLToPath(new URL(`./../renderer/dist/${htmlFileName}.html`, import.meta.url));
}
