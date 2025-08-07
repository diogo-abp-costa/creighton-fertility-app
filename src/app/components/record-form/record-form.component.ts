import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  FertilityRecord
} from '../../models/fertility-record.model';
import { FertilityDataService } from '../../services/fertility-data.service';
import { NotificationService } from '../../services/notification.service';
import {BleedingType} from "../../models/bleeding.model";
import {
  MucusColor,
  MucusConsistency,
  MucusType
} from "../../models/mucus.model";
import {FrequencyType} from "../../models/frequency.model";
import {getBleedingTypeText} from "../../utils/bleeding.util";
import {getMucusTypeText, getMucusColorText, getMucusConsistencyText} from "../../utils/mucus.util";

@Component({
  selector: 'app-record-form',
  templateUrl: './record-form.component.html',
  styleUrls: ['./record-form.component.scss']
})
export class RecordFormComponent {
  recordForm: FormGroup;

  // Simplified enum references for template
  mucusTypes = Object.values(MucusType);
  mucusColors = Object.values(MucusColor);
  mucusConsistencies = Object.values(MucusConsistency);
  bleedingTypes = Object.values(BleedingType);

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
      mucusType: [MucusType.DRY, Validators.required],
      mucusColor: [MucusColor.NONE],
      mucusConsistency: [MucusConsistency.NONE],
      sexualContact: [false],
      notes: ['']
    });
  }

  onMucusTypeChange(): void {
    // Reset color and consistency when mucus type changes
    this.recordForm.patchValue({
      mucusColor: MucusColor.NONE,
      mucusConsistency: MucusConsistency.NONE
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
    return mucusType === MucusType.LOW_STRETCH ||
        mucusType === MucusType.MEDIUM_STRETCH ||
        mucusType === MucusType.HIGH_STRETCH;
  }

  onSubmit(): void {
    if (this.recordForm.valid) {
      const formValue = this.recordForm.value;

      // Calculate frequency automatically - this will be done by the service
      const frequency = FrequencyType.ONCE; // Default, will be recalculated by service

      // Handle sexual contact note
      let notes = formValue.notes || '';

      const record: FertilityRecord = {
        id: '',
        date: formValue.date,
        time: formValue.time,
        mucus: {
          type: formValue.mucusType,
          color: this.showMucusColor() ? formValue.mucusColor : MucusColor.NONE,
          consistency: this.showMucusConsistency() ? formValue.mucusConsistency : MucusConsistency.NONE
        },
        bleeding: {
          type: formValue.bleeding
        },
        intercourse: formValue.sexualContact || false,
        frequency: frequency,
        notes: notes || undefined
      };

      try {
        console.log(record)
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

      console.log("Form valid:", this.recordForm.valid);
      console.log("Form errors:", this.recordForm.errors);
      console.log("Form value:", this.recordForm.value);

      // Verificar erros em cada campo
      Object.keys(this.recordForm.controls).forEach(key => {
        const control = this.recordForm.get(key);
        if (control?.errors) {
          console.log(`${key} errors:`, control.errors);
        }
      });
    }
  }

  protected readonly getBleedingText = getBleedingTypeText;
  protected readonly getMucusConsistencyText = getMucusConsistencyText;
  protected readonly getMucusColorText = getMucusColorText;
  protected readonly getMucusTypeText = getMucusTypeText;
}