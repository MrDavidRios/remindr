import { useEffect } from 'react';

const keyAbbreviations = new Map([
  ['escape', 'esc'],
  [',', 'comma'],
]);

function compareKeyCodeToEvent(keyCode: string, e: KeyboardEvent): boolean {
  const keywords = keyCode.split('+');

  // console.log(
  //   `(compareKeyCodeToEvent) - key abbreviation for ${e.key.toLowerCase()}: ${keyAbbreviations.get(
  //     e.key.toLowerCase(),
  //   )}`,
  // );

  const eventKey = keyAbbreviations.get(e.key.toLowerCase()) ?? e.key.toLowerCase();

  let hasShift = false;
  let hasMod = false;
  let key = '';

  if (keywords.length === 0) {
    throw new Error(`parseKeyCode: No arguments in key code; key code: ${keyCode}`);
  }

  if (keywords.length > 3) {
    throw new Error(`parseKeyCode: Too many arguments in key code, expected a maximum of three; key code: ${keyCode}`);
  }

  for (const keyword of keywords) {
    if (keyword === 'shift') {
      hasShift = true;
    } else if (keyword === 'mod') {
      hasMod = true;
    } else {
      key = keyword;
    }
  }

  if (key === '') {
    throw new Error(`parseKeyCode: No key provided; key code: ${keyCode}`);
  }

  console.log(`(compareKeyCodeToEvent) keys: ${key} vs. ${eventKey}, mod: ${hasMod} vs. ${e.metaKey}`);

  if (hasShift != e.shiftKey) return false;

  const modKeyPressed = window.electron.process.isMac() ? e.metaKey : e.ctrlKey;

  if (hasMod != modKeyPressed) return false;

  return key === eventKey;
}

export function useHotkey(keyCodes: string[], callback: (e: KeyboardEvent) => void): void {
  const handler = (e: KeyboardEvent) => {
    for (const keyCode of keyCodes) {
      if (compareKeyCodeToEvent(keyCode, e)) {
        callback(e);
        break;
      }
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handler);
    return () => {
      window.removeEventListener('keydown', handler);
    };
  }, []);
}
