// src/app/components/fertility-chart/fertility-chart.component.ts
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

  getCreightonCodes(dayRecord: DayRecord): string {
    if (!dayRecord.selectedRecord || !dayRecord.selectedRecord.notes) {
      return '';
    }

// Extract Creighton codes (everything before ' - ')
    const notes = dayRecord.selectedRecord.notes;
    const dashIndex = notes.indexOf(' - ');
    if (dashIndex !== -1) {
      return notes.substring(0, dashIndex);
    }

// If no dash found, assume it's all Creighton codes
    return notes;
  }

  getUserNotes(dayRecord: DayRecord): string {
    if (!dayRecord.records || dayRecord.records.length === 0) {
      return '';
    }

// Collect all user notes from all records of this day
    const userNotes: string[] = [];

    for (const record of dayRecord.records) {
      if (record.notes) {
        const dashIndex = record.notes.indexOf(' - ');
        if (dashIndex !== -1) {
          const userNote = record.notes.substring(dashIndex + 3).trim();
          if (userNote && userNote !== 'I' && !userNote.startsWith('I - ')) {
// Remove 'I' prefix if it's there (sexual contact)
            const cleanNote = userNote.replace(/^I\s*-\s*/, '').trim();
            if (cleanNote) {
              userNotes.push(cleanNote);
            }
          }
        }
      }
    }

// Check for sexual contact indicator
    const hasIntercourse = dayRecord.records.some(record =>
        record.notes && (record.notes.includes('I - ') || record.notes === 'I')
    );

    if (hasIntercourse) {
      userNotes.unshift('Contacto sexual');
    }

    return userNotes.join('\n');
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