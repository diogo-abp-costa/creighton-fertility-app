export interface FertilityRecord {
  id: string;
  date: string;
  time: string;
  mucusCharacteristics: MucusCharacteristics;
  bleeding: BleedingType;
  notes?: string;
  isSelected?: boolean;
}

export interface MucusCharacteristics {
  type: MucusType;
  color: MucusColor;
  consistency: MucusConsistency;
  sensation: SensationType;
}

export enum MucusType {
  DRY = 'dry',
  NOTHING = 'nothing',
  TACKY = 'tacky',
  STICKY = 'sticky',
  CREAMY = 'creamy',
  EGG_WHITE = 'eggwhite'
}

export enum MucusColor {
  CLEAR = 'clear',
  WHITE = 'white',
  CLOUDY_CLEAR = 'cloudy-clear',
  CLOUDY_WHITE = 'cloudy-white',
  YELLOW = 'yellow',
  BROWN = 'brown'
}

export enum MucusConsistency {
  NOTHING = 'nothing',
  PASTY = 'pasty',
  GUMMY = 'gummy',
  STRETCHY = 'stretchy'
}

export enum SensationType {
  DRY = 'dry',
  MOIST = 'moist',
  WET = 'wet',
  SLIPPERY = 'slippery'
}

export enum BleedingType {
  NONE = 'none',
  VERY_LIGHT = 'very-light',
  LIGHT = 'light',
  MODERATE = 'moderate',
  HEAVY = 'heavy',
  VERY_HEAVY = 'very-heavy'
}

export interface DayRecord {
  date: string;
  records: FertilityRecord[];
  selectedRecord?: FertilityRecord;
  chartSymbol: string;
  chartColor: string;
  baby?: boolean;
}
