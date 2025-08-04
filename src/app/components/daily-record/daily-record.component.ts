import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { DayRecord, FertilityRecord, BleedingType } from '../../models/fertility-record.model';
import { FertilityDataService } from '../../services/fertility-data.service';
import { NotificationService } from '../../services/notification.service';

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
      private fertilityService: FertilityDataService,
      private notificationService: NotificationService
  ) {
    this.records$ = this.fertilityService.records$;
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
    const { type, color, consistency, sensation, stretchability, lubrication } = record.mucusCharacteristics;

    const typeDesc = this.formatMucusType(type);
    const colorDesc = this.formatMucusColor(color);
    const consistencyDesc = this.formatMucusConsistency(consistency);
    const sensationDesc = this.formatSensation(sensation);
    const stretchabilityDesc = this.formatStretchability(stretchability);
    const lubricationDesc = lubrication ? 'Com lubrificação' : 'Sem lubrificação';

    const code = this.fertilityService.getMucusCode(record);

    return `${typeDesc} - ${colorDesc} - ${consistencyDesc} - ${sensationDesc} - ${stretchabilityDesc} - ${lubricationDesc} [${code}]`;
  }

  getBleedingDescription(record: FertilityRecord): string {
    const description = record.bleeding === 'none' ? 'Sem hemorragia' : this.formatBleeding(record.bleeding);
    const code = this.fertilityService.getBleedingSymbol(record.bleeding);
    return code ? `${description} [${code}]` : description;
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

  private formatMucusType(value: string): string {
    const translations: { [key: string]: string } = {
      'dry': 'Seco',
      'nothing': 'Nada',
      'tacky': 'Pegajoso',
      'sticky': 'Aderente',
      'creamy': 'Cremoso',
      'eggwhite': 'Clara de Ovo'
    };
    return translations[value] || value;
  }

  private formatMucusColor(value: string): string {
    const translations: { [key: string]: string } = {
      'clear': 'Transparente (K)',
      'white': 'Opaco (branco) (C)',
      'cloudy-clear': 'Opaco e transparente (C/K)',
      'yellow': 'Amarelo (ou amarelo claro) (Y)',
      'brown': 'Castanho (ou negro) (B)'
    };
    return translations[value] || value;
  }

  private formatMucusConsistency(value: string): string {
    const translations: { [key: string]: string } = {
      'nothing': 'Nenhuma',
      'pasty': 'Pastoso',
      'gummy': 'Goma'
    };
    return translations[value] || value;
  }

  private formatSensation(value: string): string {
    const translations: { [key: string]: string } = {
      'dry': 'Seco',
      'moist': 'Húmido',
      'wet': 'Molhado',
      'slippery': 'Brilhante/Escorregadio'
    };
    return translations[value] || value;
  }

  private formatStretchability(value: string): string {
    const translations: { [key: string]: string } = {
      'none': 'Nenhuma',
      'low': 'Pequena (6)',
      'medium': 'Média (8)',
      'high': 'Alta (10)'
    };
    return translations[value] || value;
  }

  private formatBleeding(value: string): string {
    const translations: { [key: string]: string } = {
      'none': 'Sem hemorragia',
      'very-light': 'Muito ligeira',
      'light': 'Ligeira',
      'moderate': 'Moderada',
      'heavy': 'Abundante',
      'brown': 'Castanho/Preto'
    };
    return translations[value] || value;
  }

  trackByRecordId(index: number, record: FertilityRecord): string {
    return record.id;
  }
}