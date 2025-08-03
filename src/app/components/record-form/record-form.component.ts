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

// New simplified mucus types for the form
export enum SimplifiedMucusType {
  DRY = 'dry',
  MOIST_NO_LUBRICATION = 'moist-no-lubrication',
  WET_NO_LUBRICATION = 'wet-no-lubrication',
  SLIPPERY_NO_LUBRICATION = 'slippery-no-lubrication',
  LOW_STRETCH = 'low-stretch',
  MEDIUM_STRETCH = 'medium-stretch',
  HIGH_STRETCH = 'high-stretch',
  MOIST_WITH_LUBRICATION = 'moist-with-lubrication',
  SLIPPERY_WITH_LUBRICATION = 'slippery-with-lubrication',
  WET_WITH_LUBRICATION = 'wet-with-lubrication'
}

@Component({
  selector: 'app-record-form',
  templateUrl: './record-form.component.html',
  styleUrls: ['./record-form.component.scss']
})
export class RecordFormComponent {
  recordForm: FormGroup;

  // Simplified enum references for template
  mucusTypes = Object.values(SimplifiedMucusType);
  mucusColors = Object.values(MucusColor);
  mucusConsistencies = Object.values(MucusConsistency);
  bleedingTypes = Object.values(BleedingType).filter(type => type !== BleedingType.VERY_HEAVY);

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
      bleeding: [BleedingType.NONE, Validators.required],
      mucusType: [SimplifiedMucusType.DRY, Validators.required],
      mucusColor: [MucusColor.CLEAR, Validators.required],
      mucusConsistency: [MucusConsistency.NOTHING, Validators.required],
      sexualContact: [false],
      notes: ['']
    });
  }

  onMucusTypeChange(): void {
    // Reset color and consistency when mucus type changes
    this.recordForm.patchValue({
      mucusColor: MucusColor.CLEAR,
      mucusConsistency: MucusConsistency.NOTHING
    });
  }

  showMucusColor(): boolean {
    const mucusType = this.recordForm.get('mucusType')?.value;
    return this.isStretchabilityType(mucusType);
  }

  showMucusConsistency(): boolean {
    const mucusType = this.recordForm.get('mucusType')?.value;
    return this.isStretchabilityType(mucusType);
  }

  private isStretchabilityType(mucusType: string): boolean {
    return mucusType === SimplifiedMucusType.LOW_STRETCH ||
        mucusType === SimplifiedMucusType.MEDIUM_STRETCH ||
        mucusType === SimplifiedMucusType.HIGH_STRETCH;
  }

  onSubmit(): void {
    if (this.recordForm.valid) {
      const formValue = this.recordForm.value;

      // Convert simplified mucus type to original format
      const convertedMucusData = this.convertSimplifiedMucusType(formValue.mucusType);

      // Calculate frequency automatically - this will be done by the service
      const frequency = FrequencyType.ONCE; // Default, will be recalculated by service

      // Handle sexual contact note
      let notes = formValue.notes || '';
      if (formValue.sexualContact) {
        notes = notes ? `I - ${notes}` : 'I';
      }

      const record: FertilityRecord = {
        id: '',
        date: formValue.date,
        time: formValue.time,
        mucusCharacteristics: {
          type: convertedMucusData.type,
          color: this.showMucusColor() ? formValue.mucusColor : MucusColor.CLEAR,
          consistency: this.showMucusConsistency() ? formValue.mucusConsistency : MucusConsistency.NOTHING,
          sensation: convertedMucusData.sensation,
          stretchability: convertedMucusData.stretchability,
          frequency: frequency,
          lubrication: convertedMucusData.lubrication
        },
        bleeding: formValue.bleeding,
        notes: notes || undefined
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

  private convertSimplifiedMucusType(simplifiedType: SimplifiedMucusType): {
    type: MucusType;
    sensation: SensationType;
    stretchability: StretchabilityType;
    lubrication: boolean;
  } {
    switch (simplifiedType) {
      case SimplifiedMucusType.DRY:
        return {
          type: MucusType.DRY,
          sensation: SensationType.DRY,
          stretchability: StretchabilityType.NONE,
          lubrication: false
        };

      case SimplifiedMucusType.MOIST_NO_LUBRICATION:
        return {
          type: MucusType.STICKY,
          sensation: SensationType.MOIST,
          stretchability: StretchabilityType.NONE,
          lubrication: false
        };

      case SimplifiedMucusType.WET_NO_LUBRICATION:
        return {
          type: MucusType.STICKY,
          sensation: SensationType.WET,
          stretchability: StretchabilityType.NONE,
          lubrication: false
        };

      case SimplifiedMucusType.SLIPPERY_NO_LUBRICATION:
        return {
          type: MucusType.CREAMY,
          sensation: SensationType.SLIPPERY,
          stretchability: StretchabilityType.NONE,
          lubrication: false
        };

      case SimplifiedMucusType.LOW_STRETCH:
        return {
          type: MucusType.CREAMY,
          sensation: SensationType.MOIST,
          stretchability: StretchabilityType.LOW,
          lubrication: false
        };

      case SimplifiedMucusType.MEDIUM_STRETCH:
        return {
          type: MucusType.CREAMY,
          sensation: SensationType.WET,
          stretchability: StretchabilityType.MEDIUM,
          lubrication: false
        };

      case SimplifiedMucusType.HIGH_STRETCH:
        return {
          type: MucusType.EGG_WHITE,
          sensation: SensationType.SLIPPERY,
          stretchability: StretchabilityType.HIGH,
          lubrication: false
        };

      case SimplifiedMucusType.MOIST_WITH_LUBRICATION:
        return {
          type: MucusType.STICKY,
          sensation: SensationType.MOIST,
          stretchability: StretchabilityType.NONE,
          lubrication: true
        };

      case SimplifiedMucusType.SLIPPERY_WITH_LUBRICATION:
        return {
          type: MucusType.CREAMY,
          sensation: SensationType.SLIPPERY,
          stretchability: StretchabilityType.NONE,
          lubrication: true
        };

      case SimplifiedMucusType.WET_WITH_LUBRICATION:
        return {
          type: MucusType.STICKY,
          sensation: SensationType.WET,
          stretchability: StretchabilityType.NONE,
          lubrication: true
        };

      default:
        return {
          type: MucusType.DRY,
          sensation: SensationType.DRY,
          stretchability: StretchabilityType.NONE,
          lubrication: false
        };
    }
  }

  formatMucusType(value: string): string {
    const translations: { [key: string]: string } = {
      'dry': 'Seco',
      'moist-no-lubrication': 'Húmido sem lubrificação',
      'wet-no-lubrication': 'Molhado sem lubrificação',
      'slippery-no-lubrication': 'Brilhante sem lubrificação',
      'low-stretch': 'Elasticidade pequena (<0,5 cm)',
      'medium-stretch': 'Elasticidade média (1-2cm)',
      'high-stretch': 'Elasticidade alta (>2,5cm)',
      'moist-with-lubrication': 'Húmido com lubrificação',
      'slippery-with-lubrication': 'Brilhante com lubrificação',
      'wet-with-lubrication': 'Molhado com lubrificação'
    };
    return translations[value] || value;
  }

  formatMucusColor(value: string): string {
    const translations: { [key: string]: string } = {
      'clear': 'Transparente',
      'white': 'Branco',
      'cloudy-clear': 'Transparente',
      'cloudy-white': 'Branco',
      'yellow': 'Amarelo',
      'brown': 'Castanho'
    };
    return translations[value] || value;
  }

  formatMucusConsistency(value: string): string {
    const translations: { [key: string]: string } = {
      'nothing': 'Lubrificação',
      'pasty': 'Pastoso',
      'gummy': 'Goma',
      'stretchy': 'Opaco'
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
      'none': 'Nenhum',
      'very-light': 'Muito ligeiro',
      'light': 'Ligeiro',
      'moderate': 'Moderado',
      'heavy': 'Abundante',
      'brown': 'Castanho/Preto'
    };
    return translations[value] || value;
  }
}