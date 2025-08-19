import {Injectable} from '@angular/core';
import {
  FertilityRecord
} from '../models/fertility-record.model';
import {BleedingType} from "../models/bleeding.model";
import {
  Mucus,
  MucusColor,
  MucusConsistency,
  MucusType
} from "../models/mucus.model";
import {DayRecord} from "../models/day-record.model";
import {getMucusCode, getMucusColorCode, getMucusConsistencyCode, MucusPriority} from "../utils/mucus.util";
import {FrequencyType} from "../models/frequency.model";
import {BleedingPriority, getBleedingTypeCode} from "../utils/bleeding.util";
import {getFrequencyCode} from "../utils/frequency.util";
import {StorageService} from "./storage.service";
import {Stamp} from "../models/stamp.model";
import {STAMPS} from "../utils/stamp.util";
import ObjectID from "bson-objectid";
import {NotificationService} from "./notification.service";

@Injectable({
  providedIn: 'root'
})
export class FertilityDataService {

  constructor(private storageService: StorageService) {
  }

  addRecord(record: FertilityRecord): void {
    const records = this.storageService.getRecords().value;
    const dateKey = record.date;

    let dayRecord = records.find(r => r.date === dateKey);
    if (!dayRecord) {
      dayRecord = {
        id: new ObjectID(),
        date: dateKey,
        records: [],
        stamp: STAMPS["BLEEDING_DAY"]
      };
      records.push(dayRecord);
    }

    if (!dayRecord) {
      dayRecord = {
        id: new ObjectID(),
        date: dateKey,
        records: [],
        stamp: STAMPS["BLEEDING_DAY"]
      };
      records.push(dayRecord);
    }

    record.id = this.generateId();
    dayRecord.records.push(record);

    this.updateDayRecord(dayRecord);
    this.updatePeakDayCalculations(records);

    records.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    this.storageService.getRecords().next(records);
    this.storageService.saveRecords(records);
  }

  getRecordsByDate(date: string): FertilityRecord[] {
    const dayRecord = this.storageService.getRecords().value.find(r => r.date === date);
    return dayRecord ? dayRecord.records : [];
  }

  deleteRecord(recordId: string) {
    return this.storageService.deleteRecord(recordId);
  }

  private updateDayRecord(dayRecord: DayRecord): void {
    if (dayRecord.records.length === 0) return;

    const mostSignificant = this.getMostSignificantRecord(dayRecord.records);
    dayRecord.selectedRecord = mostSignificant;

    // Calculate frequency for the most significant record type
    this.calculateFrequencyForMostSignificant(dayRecord, mostSignificant);

    const stamp = this.getStampInfo(mostSignificant);
    dayRecord.stamp = stamp;
  }

  private calculateFrequencyForMostSignificant(dayRecord: DayRecord, mostSignificant: FertilityRecord): void {
    // Count occurrences of the most significant record type
    const count = dayRecord.records.filter(record =>
        this.recordsAreEquivalent(record, mostSignificant)
    ).length;

    let frequency: FrequencyType;
    if (count > 3) {
      frequency = FrequencyType.ALL_DAY;
    } else if (count === 3) {
      frequency = FrequencyType.THREE;
    } else if (count === 2) {
      frequency = FrequencyType.TWICE;
    } else {
      frequency = FrequencyType.ONCE;
    }

    // Update frequency only for the most significant record
    mostSignificant.frequency = frequency;
  }

  private recordsAreEquivalent(record1: FertilityRecord, record2: FertilityRecord): boolean {
    // Compare the significant characteristics that determine fertility level
    const bleeding1 = record1.bleeding;
    const bleeding2 = record2.bleeding;
    const mucus1 = record1.mucus;
    const mucus2 = record2.mucus;

    return (
        bleeding1.type === bleeding2.type &&
        mucus1.type === mucus2.type &&
        mucus1.color === mucus2.color &&
        mucus1.consistency === mucus2.consistency
    );
  }

  private updatePeakDayCalculations(records: DayRecord[]): void {
    // Reset all peak day markers
    records.forEach(record => {
      // Reset colors to default
      if (record.selectedRecord) {
        const stamp = this.getStampInfo(record.selectedRecord);
        record.stamp = stamp;
      }
    });

    // Find peak days and mark post-peak days
    const sortedRecords = records.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    for (let i = 0; i < sortedRecords.length; i++) {
      const current = sortedRecords[i];
      if (this.isPeakDay(current, sortedRecords, i)) {
        current.stamp = STAMPS["PEAK_DAY"];

        // Mark the next 3 days as post-peak fertile days
        for (let j = 1; j <= 3 && i + j < sortedRecords.length; j++) {
          const postPeakRecord = sortedRecords[i + j];
          postPeakRecord.stamp = STAMPS[`PEAK_DAY_PLUS_${j}`];
        }
      }
    }
  }

  private isPeakDay(dayRecord: DayRecord, allRecords: DayRecord[], index: number): boolean {
    if (!dayRecord.selectedRecord) return false;

    const record = dayRecord.selectedRecord;
    const mucusType = record.mucus.type;
    const mucusColor = record.mucus.color
    const mucusConsistency = record.mucus.consistency;

    // Peak day criteria: last day of most fertile mucus before change to less fertile
    if ((mucusType === MucusType.LOW_STRETCH ||
        mucusType === MucusType.MEDIUM_STRETCH ||
        mucusType === MucusType.HIGH_STRETCH) ||
        mucusType === MucusType.WET_WITH_LUBRICATION ||
        mucusType === MucusType.MOIST_WITH_LUBRICATION ||
        mucusType === MucusType.SHINY_WITH_LUBRICATION ||
        mucusColor === MucusColor.CLEAR ||
        mucusConsistency === MucusConsistency.GUMMY) {

      // Check if next day is less fertile
      const currentMucusIndex = MucusPriority.indexOf(mucusType);
      if (index + 1 < allRecords.length) {
        const nextDay = allRecords[index + 1];
        if (nextDay.selectedRecord) {
          const nextMucusType = nextDay.selectedRecord.mucus.type;
          const nextMucusIndex = MucusPriority.indexOf(nextMucusType);

          if (nextMucusIndex < currentMucusIndex) {
            return true;
          }
        }
      }
    }

    return false;
  }

  private getMostSignificantRecord(records: FertilityRecord[]): FertilityRecord {
    return records.reduce((most, current) => {
      const currentBleedingIndex = BleedingPriority.indexOf(current.bleeding.type);
      const mostBleedingIndex = BleedingPriority.indexOf(most.bleeding.type);
      const currentMucusIndex = MucusPriority.indexOf(current.mucus.type);
      const mostMucusIndex = MucusPriority.indexOf(most.mucus.type);

      if (currentMucusIndex > mostMucusIndex) {
        return current;
      } else if (currentMucusIndex < mostMucusIndex) {
        return most;
      }
      else {
        if (currentBleedingIndex > mostBleedingIndex) {
          return current;
        }
        else {
          return most;
        }
      }
    });
  }

  private getStampInfo(record: FertilityRecord): Stamp {
    // Handle bleeding - always red
    if (record.bleeding.type !== BleedingType.NONE) {
      var bleeding_day = STAMPS["BLEEDING_DAY"];
      bleeding_day.symbol = this.getBleedingSymbol(record.bleeding.type) || '';
      return bleeding_day;
    }

    // Handle mucus characteristics
    switch (record.mucus.type) {
      case MucusType.DRY:
        var dry_day = STAMPS["DRY_DAY"];
        dry_day.symbol = this.getMucusSymbols(record.mucus) || '';
        return dry_day;

      case MucusType.MOIST_NO_LUBRICATION:
      case MucusType.WET_NO_LUBRICATION:
      case MucusType.SHINY_NO_LUBRICATION:
      case MucusType.LOW_STRETCH:
      case MucusType.MEDIUM_STRETCH:
      case MucusType.HIGH_STRETCH:
      case MucusType.MOIST_WITH_LUBRICATION:
      case MucusType.WET_WITH_LUBRICATION:
      case MucusType.SHINY_WITH_LUBRICATION:
        var mucus_day = STAMPS["MUCUS_DAY"];
        mucus_day.symbol = this.getMucusSymbols(record.mucus) || '';
        return mucus_day;
    }
  }

  getBleedingSymbol(bleeding: BleedingType): string {
    return getBleedingTypeCode(bleeding) || '';
  }

  getMucusSymbols(mucus: Mucus) {
    let baseSymbol = getMucusCode(mucus.type);
    let modifiers = '';

    if(mucus.color !== MucusColor.NONE) {
      modifiers += getMucusColorCode(mucus.color)
    }

    if(mucus.consistency !== MucusConsistency.NONE) {
      modifiers += getMucusConsistencyCode(mucus.consistency)
    }
    return baseSymbol + modifiers;
  }

  getCreightonSymbols(record: FertilityRecord): string {
    return this.generateCreightonSymbols(record);
  }

  private generateCreightonSymbols(record: FertilityRecord): string {
    const symbols: string[] = [];

    // Bleeding symbols
    if (record.bleeding.type !== BleedingType.NONE) {
      symbols.push(this.getBleedingSymbol(record.bleeding.type) || '');
    }

    // Mucus symbols
    symbols.push(this.getMucusSymbols(record.mucus));

    // Frequency symbols
    symbols.push(getFrequencyCode(record.frequency) || '');

    return symbols.join(' ');
  }

  private generateId(): string {
    return new ObjectID().toHexString();
  }
}