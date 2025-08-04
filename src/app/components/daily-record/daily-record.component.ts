// src/app/components/daily-record/daily-record.component.ts
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { DayRecord, FertilityRecord, MucusType, BleedingType, SensationType, StretchabilityType, FrequencyType, MucusColor, MucusConsistency } from '../../models/fertility-record.model';
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

// Show success notification
        this.notificationService.showSuccess('Registo eliminado com sucesso!');

      } catch (error) {
// Show error notification if something goes wrong
        this.notificationService.showError('Erro ao eliminar o registo. Tente novamente.');
        console.error('Error deleting record:', error);
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

// Get Creighton code for mucus
    const code = this.getMucusCode(record);

    return `${typeDesc} - ${colorDesc} - ${consistencyDesc} - ${sensationDesc} - ${stretchabilityDesc} - ${lubricationDesc} [${code}]`;
  }

  getBleedingDescription(record: FertilityRecord): string {
    const description = record.bleeding === 'none' ? 'Sem hemorragia' : this.formatBleeding(record.bleeding);
    const code = this.getBleedingCode(record.bleeding);
    return code ? `${description} [${code}]` : description;
  }

  private getMucusCode(record: FertilityRecord): string {
    const mucus = record.mucusCharacteristics;

    if (mucus.type === MucusType.DRY || mucus.type === MucusType.NOTHING) {
      return '0';
    }

    let baseSymbol = '';
    switch (mucus.stretchability) {
      case StretchabilityType.NONE:
        if (mucus.sensation === SensationType.MOIST) {
          baseSymbol = '2';
        } else if (mucus.sensation === SensationType.WET) {
          baseSymbol = '2W';
        } else if (mucus.sensation === SensationType.SLIPPERY) {
          baseSymbol = '4';
        } else {
          baseSymbol = '2';
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

    if (mucus.stretchability === StretchabilityType.HIGH && mucus.lubrication) {
      if (mucus.sensation === SensationType.MOIST) {
        baseSymbol = '10DL';
        modifiers = modifiers.replace('L', '');
      } else if (mucus.sensation === SensationType.SLIPPERY) {
        baseSymbol = '10SL';
        modifiers = modifiers.replace('L', '');
      } else if (mucus.sensation === SensationType.WET) {
        baseSymbol = '10WL';
        modifiers = modifiers.replace('L', '');
      }
    }

    return baseSymbol + modifiers;
  }

  private getBleedingCode(bleeding: BleedingType): string {
    switch (bleeding) {
      case BleedingType.VERY_LIGHT:
        return 'VL';
      case BleedingType.LIGHT:
        return 'L';
      case BleedingType.MODERATE:
        return 'M';
      case BleedingType.HEAVY:
        return 'H';
      case BleedingType.BROWN:
        return 'B';
      default:
        return '';
    }
  }

  getCreightonSymbols(record: FertilityRecord): string {
// Generate Creighton symbols
    return this.generateCreightonSymbols(record);
  }

  getOriginalNotes(record: FertilityRecord): string {
    if (!record.notes) return '';

// Extract original notes (everything after ' - ')
    const dashIndex = record.notes.indexOf(' - ');
    if (dashIndex !== -1) {
      return record.notes.substring(dashIndex + 3);
    }

// If no dash found, check if it's all Creighton symbols
    const creightonSymbols = this.generateCreightonSymbols(record);
    if (record.notes === creightonSymbols) {
      return '';
    }

    return record.notes;
  }

  private generateCreightonSymbols(record: FertilityRecord): string {
    const symbols: string[] = [];

// Bleeding symbols
    if (record.bleeding !== BleedingType.NONE) {
      symbols.push(this.getBleedingCode(record.bleeding));
    } else {
// Mucus symbols
      symbols.push(this.getMucusCode(record));
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
      'clear': 'Transparente',
      'white': 'Branco',
      'cloudy-clear': 'Opaco/Transparente',
      'cloudy-white': 'Opaco/Branco',
      'yellow': 'Amarelo',
      'brown': 'Castanho'
    };
    return translations[value] || value;
  }

  private formatMucusConsistency(value: string): string {
    const translations: { [key: string]: string } = {
      'nothing': 'Nenhuma',
      'pasty': 'Pastoso',
      'gummy': 'Goma',
      'stretchy': 'Elástico'
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