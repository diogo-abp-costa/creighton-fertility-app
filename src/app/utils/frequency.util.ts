import {FrequencyCode, FrequencyType} from "../models/frequency.model";

const FrequencyCodeMap: Record<FrequencyType, FrequencyCode> = {
  [FrequencyType.ONCE]: FrequencyCode.ONCE,
  [FrequencyType.TWICE]: FrequencyCode.TWICE,
  [FrequencyType.THREE]: FrequencyCode.THREE,
  [FrequencyType.ALL_DAY]: FrequencyCode.ALL_DAY
};

export function getFrequencyCode(frequency: FrequencyType): string {
  return FrequencyCodeMap[frequency];
}

export function getFrequencyTypeText(value: FrequencyType) {
  switch (value) {
    case FrequencyType.ONCE:
      return `Uma vez no dia [${FrequencyCode.ONCE}]`;
    case FrequencyType.TWICE:
      return `Duas vezes no dia [${FrequencyCode.TWICE}]`;
    case FrequencyType.THREE:
      return `Três vezes no dia [${FrequencyCode.THREE}]`;
    case FrequencyType.ALL_DAY:
      return `Todo o dia [${FrequencyCode.ALL_DAY}]`;
  }
}