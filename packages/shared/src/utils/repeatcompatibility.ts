import { Repeat } from "../types/classes/task/scheduledReminder.js";

/**
 * Backwards-compatible method of getting `Repeat` enum values. The enum type of `Repeat` was changed from `number`
 * to `string` in v2.2.3.
 * @param repeat
 * @returns
 */
export function getRepeatValue(repeat: Repeat) {
  if (typeof repeat === "number") {
    const repeatEnumIdx = repeat as unknown as number;
    const repeatValues = Object.values(Repeat);

    if (repeatEnumIdx < 0 || repeatEnumIdx >= repeatValues.length) {
      throw new Error(
        `Invalid repeat value: ${repeatEnumIdx}. Expected a valid Repeat enum index.`
      );
    }

    return repeatValues[repeatEnumIdx];
  }

  return repeat;
}
