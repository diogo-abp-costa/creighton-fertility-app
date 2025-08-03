import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { DayRecord } from '../../models/fertility-record.model';
import { FertilityDataService } from '../../services/fertility-data.service';

@Component({
  selector: 'app-fertility-chart',
  templateUrl: './fertility-chart.component.html',
  styleUrls: ['./fertility-chart.component.scss']
})
export class FertilityChartComponent implements OnInit {
  records$: Observable<DayRecord[]>;
  currentMonth = new Date();

  constructor(private fertilityService: FertilityDataService) {
    this.records$ = this.fertilityService.records$;
  }

  ngOnInit(): void {}

  getCurrentMonthRecords(records: DayRecord[]): DayRecord[] {
    const currentYear = this.currentMonth.getFullYear();
    const currentMonthIndex = this.currentMonth.getMonth();

    return records.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate.getFullYear() === currentYear &&
          recordDate.getMonth() === currentMonthIndex;
    });
  }

  previousMonth(): void {
    this.currentMonth = new Date(
        this.currentMonth.getFullYear(),
        this.currentMonth.getMonth() - 1,
        1
    );
  }

  nextMonth(): void {
    this.currentMonth = new Date(
        this.currentMonth.getFullYear(),
        this.currentMonth.getMonth() + 1,
        1
    );
  }

  getMonthName(): string {
    return this.currentMonth.toLocaleString('pt-PT', {
      month: 'long',
      year: 'numeric'
    });
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('pt-PT', {
      weekday: 'short',
      day: 'numeric'
    });
  }

  getRecordForDate(records: DayRecord[], date: string): DayRecord | undefined {
    return records.find(record => record.date === date);
  }

  getTextColor(backgroundColor: string): string {
    // Return appropriate text color based on background
    if (backgroundColor === '#ffffff') {
      return '#000000'; // Black text on white background
    }
    return '#ffffff'; // White text on colored backgrounds
  }

  getCreightonNotes(dayRecord: DayRecord): string {
    if (!dayRecord.selectedRecord || !dayRecord.selectedRecord.notes) {
      return '';
    }

    // Extract Creighton symbols (everything before ' - ')
    const notes = dayRecord.selectedRecord.notes;
    const dashIndex = notes.indexOf(' - ');
    if (dashIndex !== -1) {
      return notes.substring(0, dashIndex);
    }

    // If no dash found, assume it's all Creighton symbols
    return notes;
  }

  generateCalendarDays(): string[] {
    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days: string[] = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push(date.toISOString().split('T')[0]);
    }

    return days;
  }
}