import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  MucusType,
  MucusColor,
  MucusConsistency,
  SensationType,
  BleedingType,
  StretchabilityType,
  FrequencyType,
  FertilityRecord
} from '../../models/fertility-record.model';
import { FertilityDataService } from '../../services/fertility-data.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-record-form',
  templateUrl: './record-form.component.html',
  styleUrls: ['./record-form.component.scss']
})
export class RecordFormComponent {
  recordForm: FormGroup;

  // Enum references for template
  mucusTypes = Object.values(MucusType);
  mucusColors = Object.values(MucusColor);
  mucusConsistencies = Object.values(MucusConsistency);
  sensationTypes = Object.values(SensationType);
  bleedingTypes = Object.values(BleedingType);
  stretchabilityTypes = Object.values(StretchabilityType);
  frequencyTypes = Object.values(FrequencyType);

  constructor(
      private fb: FormBuilder,
      private fertilityService: FertilityDataService,
      private notificationService: NotificationService
  ) {
    this.recordForm = this.createForm();
  }

  private createForm(): FormGroup {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toTimeString().split(' ')[0].substr(0, 5);

    return this.fb.group({
      date: [today, Validators.required],
      time: [now, Validators.required],
      mucusType: [MucusType.DRY, Validators.required],
      mucusColor: [MucusColor.CLEAR, Validators.required],
      mucusConsistency: [MucusConsistency.NOTHING, Validators.required],
      sensation: [SensationType.DRY, Validators.required],
      stretchability: [StretchabilityType.NONE, Validators.required],
      frequency: [FrequencyType.ALL_DAY, Validators.required],
      lubrication: [false],
      bleeding: [BleedingType.NONE, Validators.required],
      notes: ['']
    });
  }

  onSubmit(): void {
    if (this.recordForm.valid) {
      const formValue = this.recordForm.value;

      const record: FertilityRecord = {
        id: '',
        date: formValue.date,
        time: formValue.time,
        mucusCharacteristics: {
          type: formValue.mucusType,
          color: formValue.mucusColor,
          consistency: formValue.mucusConsistency,
          sensation: formValue.sensation,
          stretchability: formValue.stretchability,
          frequency: formValue.frequency,
          lubrication: formValue.lubrication
        },
        bleeding: formValue.bleeding,
        notes: formValue.notes || undefined
      };

      try {
        this.fertilityService.addRecord(record);

        // Show success notification
        const dateFormatted = new Date(formValue.date).toLocaleDateString('pt-PT');
        const timeFormatted = new Date(`2000-01-01T${formValue.time}`).toLocaleTimeString('pt-PT', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: false
        });

        this.notificationService.showSuccess(
            `Registo adicionado com sucesso para ${dateFormatted} às ${timeFormatted}!`
        );

        // Reset form
        this.recordForm = this.createForm();

      } catch (error) {
        // Show error notification if something goes wrong
        this.notificationService.showError(
            'Erro ao guardar o registo. Tente novamente.'
        );
        console.error('Error saving record:', error);
      }
    } else {
      // Show warning if form is invalid
      this.notificationService.showWarning(
          'Por favor, preencha todos os campos obrigatórios.'
      );
    }
  }

  formatMucusType(value: string): string {
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

  formatMucusColor(value: string): string {
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

  formatMucusConsistency(value: string): string {
    const translations: { [key: string]: string } = {
      'nothing': 'Nenhuma',
      'pasty': 'Pastoso',
      'gummy': 'Goma',
      'stretchy': 'Elástico'
    };
    return translations[value] || value;
  }

  formatSensation(value: string): string {
    const translations: { [key: string]: string } = {
      'dry': 'Seco',
      'moist': 'Húmido',
      'wet': 'Molhado',
      'slippery': 'Brilhante/Escorregadio'
    };
    return translations[value] || value;
  }

  formatStretchability(value: string): string {
    const translations: { [key: string]: string } = {
      'none': 'Nenhuma (2-4)',
      'low': 'Pequena (6)',
      'medium': 'Média (8)',
      'high': 'Alta (10)'
    };
    return translations[value] || value;
  }

  formatFrequency(value: string): string {
    const translations: { [key: string]: string } = {
      'once': 'Uma vez (X1)',
      'twice': 'Duas vezes (X2)',
      'three': 'Três vezes (X3)',
      'all_day': 'Todo o dia (AD)'
    };
    return translations[value] || value;
  }

  formatBleeding(value: string): string {
    const translations: { [key: string]: string } = {
      'none': 'Sem hemorragia',
      'very-light': 'Muito ligeira (VL)',
      'light': 'Ligeira (L)',
      'moderate': 'Moderada (M)',
      'heavy': 'Abundante (H)',
      'brown': 'Castanho/Preto (B)'
    };
    return translations[value] || value;
  }
}