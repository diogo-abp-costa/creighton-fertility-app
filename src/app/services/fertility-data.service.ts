import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { 
  FertilityRecord, 
  DayRecord, 
  MucusType, 
  SensationType, 
  BleedingType 
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
    
    // Add the new record
    record.id = this.generateId();
    dayRecord.records.push(record);
    
    // Determine the most significant record for the day
    this.updateDayRecord(dayRecord);
    
    // Sort records by date
    records.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    this.recordsSubject.next(records);
    this.saveRecords(records);
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
          this.updateDayRecord(dayRecord);
        }
        break;
      }
    }
    
    this.recordsSubject.next(records);
    this.saveRecords(records);
  }

  private updateDayRecord(dayRecord: DayRecord): void {
    if (dayRecord.records.length === 0) return;
    
    // Find the most significant record (highest fertility indicator)
    const mostSignificant = this.getMostSignificantRecord(dayRecord.records);
    dayRecord.selectedRecord = mostSignificant;
    
    // Set chart symbol and color based on the most significant record
    const chartInfo = this.getChartInfo(mostSignificant);
    dayRecord.chartSymbol = chartInfo.symbol;
    dayRecord.chartColor = chartInfo.color;
    dayRecord.baby = chartInfo.baby;
  }

  private getMostSignificantRecord(records: FertilityRecord[]): FertilityRecord {
    // Priority order for mucus types (higher index = more significant)
    const mucusPriority = [
      MucusType.DRY,
      MucusType.NOTHING,
      MucusType.TACKY,
      MucusType.STICKY,
      MucusType.CREAMY,
      MucusType.EGG_WHITE
    ];
    
    // Priority order for sensations
    const sensationPriority = [
      SensationType.DRY,
      SensationType.MOIST,
      SensationType.WET,
      SensationType.SLIPPERY
    ];
    
    return records.reduce((most, current) => {
      // If current has bleeding and most doesn't, current wins
      if (current.bleeding !== BleedingType.NONE && most.bleeding === BleedingType.NONE) {
        return current;
      }
      
      // If most has bleeding and current doesn't, most wins
      if (most.bleeding !== BleedingType.NONE && current.bleeding === BleedingType.NONE) {
        return most;
      }
      
      // Compare mucus types
      const currentMucusIndex = mucusPriority.indexOf(current.mucusCharacteristics.type);
      const mostMucusIndex = mucusPriority.indexOf(most.mucusCharacteristics.type);
      
      if (currentMucusIndex > mostMucusIndex) {
        return current;
      } else if (currentMucusIndex < mostMucusIndex) {
        return most;
      }
      
      // If mucus types are equal, compare sensations
      const currentSensationIndex = sensationPriority.indexOf(current.mucusCharacteristics.sensation);
      const mostSensationIndex = sensationPriority.indexOf(most.mucusCharacteristics.sensation);
      
      if (currentSensationIndex > mostSensationIndex) {
        return current;
      }
      
      return most;
    });
  }

  private getChartInfo(record: FertilityRecord): { symbol: string; color: string; baby: boolean } {
    // Handle bleeding first
    if (record.bleeding !== BleedingType.NONE) {
      return {
        symbol: this.getBleedingSymbol(record.bleeding),
        color: '#dc3545', // Red for bleeding
        baby: false
      };
    }
    
    // Handle mucus characteristics
    switch (record.mucusCharacteristics.type) {
      case MucusType.DRY:
        return { symbol: 'D', color: '#28a745', baby: true }; // Green
      
      case MucusType.NOTHING:
        return { symbol: '∅', color: '#28a745', baby: true }; // Green
      
      case MucusType.TACKY:
        return { symbol: 'T', color: '#ffc107', baby: false }; // Yellow
      
      case MucusType.STICKY:
        return { symbol: 'S', color: '#ffc107', baby: false }; // Yellow
      
      case MucusType.CREAMY:
        if (record.mucusCharacteristics.sensation === SensationType.SLIPPERY) {
          return { symbol: 'C/L', color: '#dc3545', baby: false }; // Red
        }
        return { symbol: 'C', color: '#ffc107', baby: false }; // Yellow
      
      case MucusType.EGG_WHITE:
        return { symbol: 'L', color: '#dc3545', baby: false }; // Red
      
      default:
        return { symbol: '?', color: '#6c757d', baby: true }; // Gray
    }
  }

  private getBleedingSymbol(bleeding: BleedingType): string {
    switch (bleeding) {
      case BleedingType.VERY_LIGHT: return 'VL';
      case BleedingType.LIGHT: return 'L';
      case BleedingType.MODERATE: return 'M';
      case BleedingType.HEAVY: return 'H';
      case BleedingType.VERY_HEAVY: return 'VH';
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
