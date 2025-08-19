import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { RecordFormComponent } from './components/record-form/record-form.component';
import { FertilityChartComponent } from './components/fertility-chart/fertility-chart.component';
import { DailyRecordComponent } from './components/daily-record/daily-record.component';
import { NotificationComponent } from './components/notification/notification.component';
import {HttpClientModule} from "@angular/common/http";
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';

@NgModule({
  declarations: [
    AppComponent,
    RecordFormComponent,
    FertilityChartComponent,
    DailyRecordComponent,
    NotificationComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

// Registra os dados de localização para português
registerLocaleData(localePt, 'pt');

// (Opcional) caso queira garantir, pode usar também 'pt-PT'
registerLocaleData(localePt, 'pt-PT');