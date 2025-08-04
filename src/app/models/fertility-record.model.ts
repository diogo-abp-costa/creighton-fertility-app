export interface FertilityRecord {
  id: string;
  date: string;
  time: string;
  mucusCharacteristics: MucusCharacteristics;
  bleeding: BleedingType;
  notes?: string;
  hasIntercourse: boolean;
  isSelected?: boolean;
}

export interface MucusCharacteristics {
  type: MucusType;
  color: MucusColor;
  consistency: MucusConsistency;
  sensation: SensationType;
  lubrication: boolean;
  stretchability: StretchabilityType;
  frequency: FrequencyType;
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
  CLEAR = 'clear',           // K - Transparente
  WHITE = 'white',           // C - Opaco (branco)
  CLOUDY_CLEAR = 'cloudy-clear', // C/K - Opaco e transparente
  YELLOW = 'yellow',         // Y - Amarelo (ou amarelo claro)
  BROWN = 'brown'            // B - Castanho (ou negro)
}

export enum MucusConsistency {
  NOTHING = 'nothing',
  PASTY = 'pasty',
  GUMMY = 'gummy'
}

export enum SensationType {
  DRY = 'dry',
  MOIST = 'moist',
  WET = 'wet',
  SLIPPERY = 'slippery'
}

export enum StretchabilityType {
  NONE = 'none',
  LOW = 'low',     // 6
  MEDIUM = 'medium', // 8
  HIGH = 'high'    // 10
}

export enum FrequencyType {
  ONCE = 'once',      // X1
  TWICE = 'twice',    // X2
  THREE = 'three',    // X3
  ALL_DAY = 'all_day' // AD
}

export enum BleedingType {
  NONE = 'none',
  VERY_LIGHT = 'very-light',    // VL
  LIGHT = 'light',              // L
  MODERATE = 'moderate',        // M
  HEAVY = 'heavy',              // H
  BROWN = 'brown'               // B
}

export interface DayRecord {
  date: string;
  records: FertilityRecord[];
  selectedRecord?: FertilityRecord;
  chartSymbol: string;
  chartColor: string;
  baby?: boolean;
  peakDay?: boolean;
  postPeakDay?: number; // Days after peak (1, 2, 3...)
}