import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  FertilityRecord,
  DayRecord,
  MucusType,
  SensationType,
  BleedingType,
  StretchabilityType,
  FrequencyType,
  MucusColor,
  MucusConsistency
} from '../models/fertility-record.model';

@Injectable({
  providedIn: 'root'
})
export class FertilityDataService {
  private readonly storageKey = 'fertility-records';
  private recordsSubject = new BehaviorSubject<DayRecord[]>([]);

  records$ = this.recordsSubject.asObservable();

  constructor() {
    this.loadRecords();
  }

  addRecord(record: FertilityRecord): void {
    const records = this.recordsSubject.value;
    const dateKey = record.date;

    let dayRecord = records.find(r => r.date === dateKey);

    if (!dayRecord) {
      dayRecord = {
        date: dateKey,
        records: [],
        chartSymbol: '',
        chartColor: '',
        baby: false
      };
      records.push(dayRecord);
    }

    record.id = this.generateId();
    dayRecord.records.push(record);

    // Calculate frequency automatically for all records of the day
    this.calculateFrequencyForDay(dayRecord);

    this.updateDayRecord(dayRecord);
    this.updatePeakDayCalculations(records);

    records.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    this.recordsSubject.next(records);
    this.saveRecords(records);
  }

  private calculateFrequencyForDay(dayRecord: DayRecord): void {
    const recordCount = dayRecord.records.length;
    let frequency: FrequencyType;

    if (recordCount > 3) {
      frequency = FrequencyType.ALL_DAY;
    } else if (recordCount === 3) {
      frequency = FrequencyType.THREE;
    } else if (recordCount === 2) {
      frequency = FrequencyType.TWICE;
    } else {
      frequency = FrequencyType.ONCE;
    }

    // Update frequency for all records in the day
    dayRecord.records.forEach(record => {
      record.mucusCharacteristics.frequency = frequency;
    });
  }

  getRecordsByDate(date: string): FertilityRecord[] {
    const dayRecord = this.recordsSubject.value.find(r => r.date === date);
    return dayRecord ? dayRecord.records : [];
  }

  deleteRecord(recordId: string): void {
    const records = this.recordsSubject.value;

    for (const dayRecord of records) {
      const index = dayRecord.records.findIndex(r => r.id === recordId);
      if (index !== -1) {
        dayRecord.records.splice(index, 1);

        if (dayRecord.records.length === 0) {
          const dayIndex = records.indexOf(dayRecord);
          records.splice(dayIndex, 1);
        } else {
          // Recalculate frequency after deletion
          this.calculateFrequencyForDay(dayRecord);
          this.updateDayRecord(dayRecord);
        }
        break;
      }
    }

    this.updatePeakDayCalculations(records);
    this.recordsSubject.next(records);
    this.saveRecords(records);
  }

  private updateDayRecord(dayRecord: DayRecord): void {
    if (dayRecord.records.length === 0) return;

    const mostSignificant = this.getMostSignificantRecord(dayRecord.records);
    dayRecord.selectedRecord = mostSignificant;

    const chartInfo = this.getChartInfo(mostSignificant);
    dayRecord.chartSymbol = chartInfo.symbol;
    dayRecord.chartColor = chartInfo.color;
    dayRecord.baby = chartInfo.baby;

    // Generate automatic notes based on Creighton symbols
    const automaticNotes = this.generateCreightonSymbols(mostSignificant);
    if (automaticNotes) {
      dayRecord.selectedRecord.notes = automaticNotes + (mostSignificant.notes ? ' - ' + mostSignificant.notes : '');
    }
  }

  private updatePeakDayCalculations(records: DayRecord[]): void {
    // Reset all peak day markers
    records.forEach(record => {
      record.peakDay = false;
      record.postPeakDay = undefined;
    });

    // Find peak days and mark post-peak days
    const sortedRecords = records.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    for (let i = 0; i < sortedRecords.length; i++) {
      const current = sortedRecords[i];
      if (this.isPeakDay(current, sortedRecords, i)) {
        current.peakDay = true;

        // Mark next 3 days as post-peak fertile days
        for (let j = 1; j <= 3 && i + j < sortedRecords.length; j++) {
          const postPeakRecord = sortedRecords[i + j];
          postPeakRecord.postPeakDay = j;

          // Update color for post-peak days (Green with baby for dry days)
          if (postPeakRecord.selectedRecord &&
              (postPeakRecord.selectedRecord.mucusCharacteristics.type === MucusType.DRY ||
                  postPeakRecord.selectedRecord.mucusCharacteristics.type === MucusType.NOTHING)) {
            postPeakRecord.chartColor = '#28a745'; // Green
            postPeakRecord.baby = true;
          }
        }
      }
    }
  }

  private isPeakDay(dayRecord: DayRecord, allRecords: DayRecord[], index: number): boolean {
    if (!dayRecord.selectedRecord) return false;

    const record = dayRecord.selectedRecord;
    const mucusType = record.mucusCharacteristics.type;

    // Peak day criteria: last day of most fertile mucus before change to less fertile
    if (mucusType === MucusType.EGG_WHITE ||
        (mucusType === MucusType.CREAMY && record.mucusCharacteristics.sensation === SensationType.SLIPPERY)) {

      // Check if next day is less fertile
      if (index + 1 < allRecords.length) {
        const nextDay = allRecords[index + 1];
        if (nextDay.selectedRecord) {
          const nextMucusType = nextDay.selectedRecord.mucusCharacteristics.type;
          if (nextMucusType === MucusType.DRY || nextMucusType === MucusType.NOTHING ||
              nextMucusType === MucusType.TACKY || nextMucusType === MucusType.STICKY) {
            return true;
          }
        }
      }
    }

    return false;
  }

  private generateCreightonSymbols(record: FertilityRecord): string {
    const symbols: string[] = [];

    // Bleeding symbols
    if (record.bleeding !== BleedingType.NONE) {
      switch (record.bleeding) {
        case BleedingType.VERY_LIGHT:
          symbols.push('VL');
          break;
        case BleedingType.LIGHT:
          symbols.push('L');
          break;
        case BleedingType.MODERATE:
          symbols.push('M');
          break;
        case BleedingType.HEAVY:
          symbols.push('H');
          break;
        case BleedingType.BROWN:
          symbols.push('B');
          break;
      }
    } else {
      // Mucus symbols
      const mucus = record.mucusCharacteristics;

      if (mucus.type === MucusType.DRY) {
        symbols.push('0');
      } else if (mucus.type === MucusType.NOTHING) {
        symbols.push('0');
      } else {
        // Stretchability numbers
        let baseSymbol = '';
        switch (mucus.stretchability) {
          case StretchabilityType.NONE:
            if (mucus.sensation === SensationType.MOIST) {
              baseSymbol = mucus.lubrication ? '2' : '2';
            } else if (mucus.sensation === SensationType.WET) {
              baseSymbol = mucus.lubrication ? '2W' : '2W';
            } else if (mucus.sensation === SensationType.SLIPPERY) {
              baseSymbol = '4';
            }
            break;
          case StretchabilityType.LOW:
            baseSymbol = '6';
            break;
          case StretchabilityType.MEDIUM:
            baseSymbol = '8';
            break;
          case StretchabilityType.HIGH:
            baseSymbol = '10';
            break;
        }

        // Add color/consistency modifiers
        let modifiers = '';
        if (mucus.stretchability !== StretchabilityType.NONE) {
          switch (mucus.color) {
            case MucusColor.BROWN:
              modifiers += 'B';
              break;
            case MucusColor.WHITE:
            case MucusColor.CLOUDY_WHITE:
              modifiers += 'C';
              break;
            case MucusColor.CLEAR:
              modifiers += 'K';
              break;
            case MucusColor.CLOUDY_CLEAR:
              modifiers += 'C/K';
              break;
            case MucusColor.YELLOW:
              modifiers += 'Y';
              break;
          }

          switch (mucus.consistency) {
            case MucusConsistency.GUMMY:
              modifiers += 'G';
              break;
            case MucusConsistency.PASTY:
              modifiers += 'P';
              break;
          }

          if (mucus.lubrication) {
            modifiers += 'L';
          }
        }

        // Special cases for lubrication with high stretchability
        if (mucus.stretchability === StretchabilityType.HIGH && mucus.lubrication) {
          if (mucus.sensation === SensationType.MOIST) {
            baseSymbol = '10DL';
          } else if (mucus.sensation === SensationType.SLIPPERY) {
            baseSymbol = '10SL';
          } else if (mucus.sensation === SensationType.WET) {
            baseSymbol = '10WL';
          }
        }

        symbols.push(baseSymbol + modifiers);
      }
    }

    // Add frequency
    switch (record.mucusCharacteristics.frequency) {
      case FrequencyType.ONCE:
        symbols.push('X1');
        break;
      case FrequencyType.TWICE:
        symbols.push('X2');
        break;
      case FrequencyType.THREE:
        symbols.push('X3');
        break;
      case FrequencyType.ALL_DAY:
        symbols.push('AD');
        break;
    }

    return symbols.join(' ');
  }

  private getMostSignificantRecord(records: FertilityRecord[]): FertilityRecord {
    const mucusPriority = [
      MucusType.DRY,
      MucusType.NOTHING,
      MucusType.TACKY,
      MucusType.STICKY,
      MucusType.CREAMY,
      MucusType.EGG_WHITE
    ];

    const sensationPriority = [
      SensationType.DRY,
      SensationType.MOIST,
      SensationType.WET,
      SensationType.SLIPPERY
    ];

    return records.reduce((most, current) => {
      if (current.bleeding !== BleedingType.NONE && most.bleeding === BleedingType.NONE) {
        return current;
      }

      if (most.bleeding !== BleedingType.NONE && current.bleeding === BleedingType.NONE) {
        return most;
      }

      const currentMucusIndex = mucusPriority.indexOf(current.mucusCharacteristics.type);
      const mostMucusIndex = mucusPriority.indexOf(most.mucusCharacteristics.type);

      if (currentMucusIndex > mostMucusIndex) {
        return current;
      } else if (currentMucusIndex < mostMucusIndex) {
        return most;
      }

      const currentSensationIndex = sensationPriority.indexOf(current.mucusCharacteristics.sensation);
      const mostSensationIndex = sensationPriority.indexOf(most.mucusCharacteristics.sensation);

      if (currentSensationIndex > mostSensationIndex) {
        return current;
      }

      return most;
    });
  }

  private getChartInfo(record: FertilityRecord): { symbol: string; color: string; baby: boolean } {
    // Handle bleeding
    if (record.bleeding !== BleedingType.NONE) {
      return {
        symbol: this.getBleedingSymbol(record.bleeding),
        color: '#dc3545', // Red
        baby: false
      };
    }

    // Handle mucus characteristics
    switch (record.mucusCharacteristics.type) {
      case MucusType.DRY:
      case MucusType.NOTHING:
        return { symbol: '0', color: '#28a745', baby: true }; // Green with baby

      case MucusType.TACKY:
      case MucusType.STICKY:
      case MucusType.CREAMY:
        if (record.mucusCharacteristics.sensation === SensationType.SLIPPERY) {
          return { symbol: 'L', color: '#dc3545', baby: false }; // Red
        }
        return { symbol: 'M', color: '#ffffff', baby: true }; // White with baby

      case MucusType.EGG_WHITE:
        return { symbol: 'L', color: '#dc3545', baby: false }; // Red

      default:
        return { symbol: '?', color: '#6c757d', baby: true };
    }
  }

  private getBleedingSymbol(bleeding: BleedingType): string {
    switch (bleeding) {
      case BleedingType.VERY_LIGHT: return 'VL';
      case BleedingType.LIGHT: return 'L';
      case BleedingType.MODERATE: return 'M';
      case BleedingType.HEAVY: return 'H';
      case BleedingType.BROWN: return 'B';
      default: return '';
    }
  }

  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  private loadRecords(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const records = JSON.parse(stored);
        this.recordsSubject.next(records);
      }
    } catch (error) {
      console.error('Error loading records:', error);
    }
  }

  private saveRecords(records: DayRecord[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(records));
    } catch (error) {
      console.error('Error saving records:', error);
    }
  }
}