import { describe, expect, it } from "vitest";
import { Repeat } from "../../src/types/classes/task/repeatInfo.js";
import { getRepeatValue } from "../../src/utils/repeatutils/repeatcompatibility.js";

describe("getRepeatValue", () => {
  it("should return the correct Repeat value for number input", () => {
    const repeatValue = getRepeatValue(0 as unknown as Repeat);
    expect(repeatValue).toBe(Repeat.NoRepeat);
  });

  it("throws error for invalid number input", () => {
    const possibleRepeatValues = Object.values(Repeat).length;

    expect(() => getRepeatValue(-1 as unknown as Repeat)).toThrow(
      `Invalid repeat value: -1. Expected a valid Repeat enum index.`
    );
    expect(() =>
      getRepeatValue(possibleRepeatValues as unknown as Repeat)
    ).toThrow(
      `Invalid repeat value: ${possibleRepeatValues}. Expected a valid Repeat enum index.`
    );
  });

  it("should return the correct Repeat value for enum input", () => {
    const repeatValue = getRepeatValue(Repeat.Daily);
    expect(repeatValue).toBe(Repeat.Daily);
  });
});
