import {Stamp} from "../models/stamp.model";

export const STAMPS: { [key: string]: Stamp } = {
  BLEEDING_DAY: {
    symbol: '',
    color: '#dc3545',
    baby: false,
    isPeakDay: false,
    postPeakDay: undefined
  },
  DRY_DAY: {
    symbol: '',
    color: '#28a745',
    baby: false,
    isPeakDay: false,
    postPeakDay: undefined
  },
  MUCUS_DAY: {
    symbol: '',
    color: '#ffffff',
    baby: true,
    isPeakDay: false,
    postPeakDay: undefined
  },
  PEAK_DAY: {
    symbol: '',
    color: '#ffffff',
    baby: true,
    isPeakDay: true,
    postPeakDay: undefined
  },
  PEAK_DAY_PLUS_1: {
    symbol: '',
    color: '#28a745',
    baby: true,
    isPeakDay: false,
    postPeakDay: 1
  },
  PEAK_DAY_PLUS_2: {
    symbol: '',
    color: '#28a745',
    baby: true,
    isPeakDay: false,
    postPeakDay: 2
  },
  PEAK_DAY_PLUS_3: {
    symbol: '',
    color: '#28a745',
    baby: true,
    isPeakDay: false,
    postPeakDay: 3
  },
} as const;