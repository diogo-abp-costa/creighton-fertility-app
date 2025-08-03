import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { DayRecord, FertilityRecord } from '../../models/fertility-record.model';
import { FertilityDataService } from '../../services/fertility-data.service';

@Component({
  selector: 'app-daily-record',
  templateUrl: './daily-record.component.html',
  styleUrls: ['./daily-record.component.scss']
})
export class DailyRecordComponent implements OnInit {
  records$: Observable<DayRecord[]>;
  selectedDate: string = '';
  selectedDayRecords: FertilityRecord[] = [];

  constructor(private fertilityService: FertilityDataService) {
    this.records$ = this.fertilityService.records$;
  }

  ngOnInit(): void {
    // Set today as default selected date
    this.selectedDate = new Date().toISOString().split('T')[0];
    this.loadRecordsForDate();
  }

  onDateChange(): void {
    this.loadRecordsForDate();
  }

  private loadRecordsForDate(): void {
    this.selectedDayRecords = this.fertilityService.getRecordsByDate(this.selectedDate);
  }

  deleteRecord(recordId: string): void {
    if (confirm('Are you sure you want to delete this record?')) {
      this.fertilityService.deleteRecord(recordId);
      this.loadRecordsForDate();
    }
  }

  formatTime(time: string): string {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }

  formatEnumValue(value: string): string {
    return value.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }

  getMucusDescription(record: FertilityRecord): string {
    const { type, color, consistency, sensation } = record.mucusCharacteristics;
    return `${this.formatEnumValue(type)} - ${this.formatEnumValue(color)} - ${this.formatEnumValue(consistency)} - ${this.formatEnumValue(sensation)}`;
  }

  getBleedingDescription(record: FertilityRecord): string {
    return record.bleeding === 'none' ? 'No bleeding' : this.formatEnumValue(record.bleeding);
  }

  trackByRecordId(index: number, record: FertilityRecord): string {
    return record.id;
  }
}
