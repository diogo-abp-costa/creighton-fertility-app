export interface Mucus {
  type: MucusType;
  color: MucusColor;
  consistency: MucusConsistency;
}

export enum MucusType {
  DRY = 'dry',                                        // 0
  MOIST_NO_LUBRICATION = 'moist-no-lubrication',      // 2
  WET_NO_LUBRICATION = 'wet-no-lubrication',          // 2W
  SHINY_NO_LUBRICATION = 'shiny-no-lubrication',      // 4
  LOW_STRETCH = 'low-stretch',                        // 6
  MEDIUM_STRETCH = 'medium-stretch',                  // 8
  HIGH_STRETCH = 'high-stretch',                      // 10
  MOIST_WITH_LUBRICATION = 'moist-with-lubrication',  // 10DL
  SHINY_WITH_LUBRICATION = 'shiny-with-lubrication',  // 10SL
  WET_WITH_LUBRICATION = 'wet-with-lubrication'       // 10WL
}

export enum MucusTypeCode {
  DRY = '0',
  MOIST_NO_LUBRICATION = '2',
  WET_NO_LUBRICATION = '2W',
  SHINY_NO_LUBRICATION = '4',
  LOW_STRETCH = '6',
  MEDIUM_STRETCH = '8',
  HIGH_STRETCH = '10',
  MOIST_WITH_LUBRICATION = '10DL',
  SHINY_WITH_LUBRICATION = '10SL',
  WET_WITH_LUBRICATION = '10WL'
}

export enum MucusColor {
  NONE = '',
  CLEAR = 'clear',                // K
  WHITE = 'white',                // C
  CLOUDY_CLEAR = 'cloudy-clear',  // C/K
  YELLOW = 'yellow',              // Y
  BROWN = 'brown'                 // B
}

export enum MucusColorCode {
  NONE = '',
  CLEAR = 'K',
  WHITE = 'C',
  CLOUDY_CLEAR = 'C/K',
  YELLOW = 'Y',
  BROWN = 'B'
}

export enum MucusConsistency {
  NONE = '',
  PASTY = 'pasty',
  GUMMY = 'gummy'
}

export enum MucusConsistencyCode {
  NONE = '',
  PASTY = 'P',
  GUMMY = 'G'
}