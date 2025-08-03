import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { 
  MucusType, 
  MucusColor, 
  MucusConsistency, 
  SensationType, 
  BleedingType,
  FertilityRecord 
} from '../../models/fertility-record.model';
import { FertilityDataService } from '../../services/fertility-data.service';

@Component({
  selector: 'app-record-form',
  templateUrl: './record-form.component.html',
  styleUrls: ['./record-form.component.scss']
})
export class RecordFormComponent {
  recordForm: FormGroup;
  showSuccess = false;
  
  // Enum references for template
  mucusTypes = Object.values(MucusType);
  mucusColors = Object.values(MucusColor);
  mucusConsistencies = Object.values(MucusConsistency);
  sensationTypes = Object.values(SensationType);
  bleedingTypes = Object.values(BleedingType);

  constructor(
    private fb: FormBuilder,
    private fertilityService: FertilityDataService
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
      bleeding: [BleedingType.NONE, Validators.required],
      notes: ['']
    });
  }

  onSubmit(): void {
    if (this.recordForm.valid) {
      const formValue = this.recordForm.value;
      
      const record: FertilityRecord = {
        id: '', // Will be set by service
        date: formValue.date,
        time: formValue.time,
        mucusCharacteristics: {
          type: formValue.mucusType,
          color: formValue.mucusColor,
          consistency: formValue.mucusConsistency,
          sensation: formValue.sensation
        },
        bleeding: formValue.bleeding,
        notes: formValue.notes || undefined
      };
      
      this.fertilityService.addRecord(record);
      
      // Show success message
      this.showSuccess = true;
      setTimeout(() => this.showSuccess = false, 3000);
      
      // Reset form with current date/time
      this.recordForm = this.createForm();
    }
  }

  formatEnumValue(value: string): string {
    return value.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }
}
