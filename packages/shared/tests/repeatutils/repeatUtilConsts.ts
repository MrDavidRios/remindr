import {
  FrequencyType,
  IntervalFrequencyType,
} from "../../src/types/classes/task/repeatInfo";

export const intervalFrequencyTypes: IntervalFrequencyType[] = [
  FrequencyType.FixedIntervalMinutes,
  FrequencyType.FixedIntervalHours,
  FrequencyType.FixedIntervalDays,
  FrequencyType.FixedIntervalWeeks,
  FrequencyType.FixedIntervalMonths,
  FrequencyType.FixedIntervalYears,
];
