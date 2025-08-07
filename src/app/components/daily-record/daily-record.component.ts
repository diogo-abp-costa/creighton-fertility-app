import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { FertilityRecord } from '../../models/fertility-record.model';
import { FertilityDataService } from '../../services/fertility-data.service';
import { NotificationService } from '../../services/notification.service';
import {DayRecord} from "../../models/day-record.model";
import {getMucusColorText, getMucusConsistencyText, getMucusTypeText} from "../../utils/mucus.util";
import {getBleedingTypeText} from "../../utils/bleeding.util";
import {StorageService} from "../../services/storage.service";

@Component({
  selector: 'app-daily-record',
  templateUrl: './daily-record.component.html',
  styleUrls: ['./daily-record.component.scss']
})
export class DailyRecordComponent implements OnInit {
  records$: Observable<DayRecord[]>;
  selectedDate: string = '';
  selectedDayRecords: FertilityRecord[] = [];

  constructor(
      private storageService: StorageService,
      private fertilityService: FertilityDataService,
      private notificationService: NotificationService
  ) {
    this.records$ = this.storageService.records$;
  }

  ngOnInit(): void {
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
    if (confirm('Tem a certeza de que deseja eliminar este registo?')) {
      try {
        this.fertilityService.deleteRecord(recordId);
        this.loadRecordsForDate();
        this.notificationService.showSuccess('Registo eliminado com sucesso!');
      } catch (error) {
        this.notificationService.showError('Erro ao eliminar o registo. Tente novamente.');
      }
    }
  }

  formatTime(time: string): string {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('pt-PT', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: false
    });
  }

  getMucusDescription(record: FertilityRecord): string {
    const { type, color, consistency } = record.mucus;

    const typeDesc = getMucusTypeText(type);
    const colorDesc = getMucusColorText(color);
    const consistencyDesc = getMucusConsistencyText(consistency);

    const descriptionParts = [typeDesc, colorDesc, consistencyDesc].filter(Boolean);
    const descriptionText = descriptionParts.join(' - ');

    return `${descriptionText}`;
  }

  getBleedingDescription(record: FertilityRecord): string {
    const descriptionText = getBleedingTypeText(record.bleeding.type);
    return `${descriptionText}`;
  }

  getCreightonSymbols(record: FertilityRecord): string {
    return this.fertilityService.getCreightonSymbols(record);
  }

  getOriginalNotes(record: FertilityRecord): string {
    if (!record.notes) return '';

    const dashIndex = record.notes.indexOf(' - ');
    if (dashIndex !== -1) {
      return record.notes.substring(dashIndex + 3);
    }

    const creightonSymbols = this.getCreightonSymbols(record);
    if (record.notes === creightonSymbols) {
      return '';
    }

    return record.notes;
  }

  trackByRecordId(index: number, record: FertilityRecord): string {
    return record.id;
  }
}