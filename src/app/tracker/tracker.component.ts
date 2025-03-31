import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { JoggingTrackerComponent } from './jogging-tracker/jogging-tracker.component';
import { StorageService } from '../services/storage.service';
import { MatIconModule } from '@angular/material/icon';
import { JoggingRecordsComponent } from './jogging-records/jogging-records.component';

@Component({
  selector: 'app-tracker',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    JoggingTrackerComponent,
    MatIconModule,
    JoggingRecordsComponent
  ],
  templateUrl: './tracker.component.html',
  styleUrls: ['./tracker.component.scss']
})
export class TrackerComponent {
  constructor(private storage: StorageService) {
    this.storage.changeTheme();
  }
  // Swimming tracker logic will be added here
}
