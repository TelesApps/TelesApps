import { Component } from '@angular/core';
import { StorageService } from '../services/storage.service';
import { MatTabsModule } from '@angular/material/tabs';

@Component({
  selector: 'app-tracker',
  imports: [MatTabsModule],
  templateUrl: './tracker.component.html',
  styleUrl: './tracker.component.scss'
})
export class TrackerComponent {

  constructor(public storage: StorageService) {
      this.storage.changeTheme();
    }

}
