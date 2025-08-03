import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Método Creighton - Cuidados de Fertilidade';
  activeTab = 'record';

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }
}