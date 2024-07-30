import minW10 from '../../../../assets/icons/min-w-10.png';
import minW12 from '../../../../assets/icons/min-w-12.png';
import minW15 from '../../../../assets/icons/min-w-15.png';
import minW20 from '../../../../assets/icons/min-w-20.png';
import minW24 from '../../../../assets/icons/min-w-24.png';
import minW30 from '../../../../assets/icons/min-w-30.png';

import maxW10 from '../../../../assets/icons/max-w-10.png';
import maxW12 from '../../../../assets/icons/max-w-12.png';
import maxW15 from '../../../../assets/icons/max-w-15.png';
import maxW20 from '../../../../assets/icons/max-w-20.png';
import maxW24 from '../../../../assets/icons/max-w-24.png';
import maxW30 from '../../../../assets/icons/max-w-30.png';

import restoreW10 from '../../../../assets/icons/restore-w-10.png';
import restoreW12 from '../../../../assets/icons/restore-w-12.png';
import restoreW15 from '../../../../assets/icons/restore-w-15.png';
import restoreW20 from '../../../../assets/icons/restore-w-20.png';
import restoreW24 from '../../../../assets/icons/restore-w-24.png';
import restoreW30 from '../../../../assets/icons/restore-w-30.png';

import closeW10 from '../../../../assets/icons/close-w-10.png';
import closeW12 from '../../../../assets/icons/close-w-12.png';
import closeW15 from '../../../../assets/icons/close-w-15.png';
import closeW20 from '../../../../assets/icons/close-w-20.png';
import closeW24 from '../../../../assets/icons/close-w-24.png';
import closeW30 from '../../../../assets/icons/close-w-30.png';

export const titlebarIcons = {
  min: [
    { src: minW10, size: 10 },
    { src: minW12, size: 12 },
    { src: minW15, size: 15 },
    { src: minW20, size: 20 },
    { src: minW24, size: 24 },
    { src: minW30, size: 30 },
  ],
  max: [
    { src: maxW10, size: 10 },
    { src: maxW12, size: 12 },
    { src: maxW15, size: 15 },
    { src: maxW20, size: 20 },
    { src: maxW24, size: 24 },
    { src: maxW30, size: 30 },
  ],
  restore: [
    { src: restoreW10, size: 10 },
    { src: restoreW12, size: 12 },
    { src: restoreW15, size: 15 },
    { src: restoreW20, size: 20 },
    { src: restoreW24, size: 24 },
    { src: restoreW30, size: 30 },
  ],
  close: [
    { src: closeW10, size: 10 },
    { src: closeW12, size: 12 },
    { src: closeW15, size: 15 },
    { src: closeW20, size: 20 },
    { src: closeW24, size: 24 },
    { src: closeW30, size: 30 },
  ],
};

export function mapIconsToSrcSet(icons: { src: string; size: number }[]): string {
  return icons.map((icon) => `${icon.src} ${icon.size}w`).join(', ');
}
