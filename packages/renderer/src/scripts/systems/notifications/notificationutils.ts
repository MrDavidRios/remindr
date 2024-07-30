export function updateTheme(stringifiedThemeData: string) {
  const themeData = JSON.parse(stringifiedThemeData) as Record<string, string>;

  const root = document.documentElement;
  Object.keys(themeData).forEach((key) => {
    root.style.setProperty(key, themeData[key]);
  });
}
