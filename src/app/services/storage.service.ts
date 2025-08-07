import {DayRecord} from "../models/day-record.model";
import {BehaviorSubject} from "rxjs";
import {Injectable} from "@angular/core";

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly storageKey = 'fertility-records';
  private recordsSubject = new BehaviorSubject<DayRecord[]>([]);

  records$ = this.recordsSubject.asObservable();

  constructor() {
    this.loadRecords();
  }

  private loadRecords(): void {
    console.log('Loading records from local storage...');
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const records = JSON.parse(stored);
        this.recordsSubject.next(records);
      }
    } catch (error) {
      // Error handling without console.log
    }
  }

  getRecords(): BehaviorSubject<DayRecord[]> {
    return this.recordsSubject;
  }

  saveRecords(records: DayRecord[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(records));
    } catch (error) {
      // Error handling without console.log
    }
  }
}