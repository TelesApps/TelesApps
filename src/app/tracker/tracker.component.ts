import { Component } from '@angular/core';
import { StorageService } from '../services/storage.service';

@Component({
  selector: 'app-tracker',
  imports: [],
  templateUrl: './tracker.component.html',
  styleUrl: './tracker.component.scss'
})
export class TrackerComponent {

  constructor(public storage: StorageService) {
      this.storage.changeTheme();
    }

}
