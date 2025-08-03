import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { RecordFormComponent } from './components/record-form/record-form.component';
import { FertilityChartComponent } from './components/fertility-chart/fertility-chart.component';
import { DailyRecordComponent } from './components/daily-record/daily-record.component';

@NgModule({
  declarations: [
    AppComponent,
    RecordFormComponent,
    FertilityChartComponent,
    DailyRecordComponent
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
