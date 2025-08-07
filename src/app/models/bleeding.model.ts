export interface Bleeding {
  type: BleedingType;
}

export enum BleedingType {
  NONE = 'none',
  VERY_LIGHT = 'very-light',    // VL
  LIGHT = 'light',              // L
  MODERATE = 'moderate',        // M
  HEAVY = 'heavy',              // H
  BROWN = 'brown'               // B
}

export enum BleedingTypeCode {
  VERY_LIGHT = 'VL',
  LIGHT = 'L',
  MODERATE = 'M',
  HEAVY = 'H',
  BROWN = 'B'
}