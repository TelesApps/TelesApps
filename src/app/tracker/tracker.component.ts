import { Component, OnDestroy, OnInit, signal, WritableSignal } from '@angular/core';
import { StorageService } from '../services/storage.service';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { UserData } from '../interfaces/user-data.interface';
import { AuthService } from '../services/auth.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { TimeRecordPipe } from '../shared/pipes/time-record.pipe';
import { MatButtonModule } from '@angular/material/button';
import { FireTimeRecordPipe } from '../shared/pipes/fire-time-record.pipe';

@Component({
  selector: 'app-tracker',
  imports: [
    TimeRecordPipe,
    FireTimeRecordPipe,
    CommonModule,
    FormsModule,
    MatTabsModule,
    MatCardModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatButtonModule
  ],
  templateUrl: './tracker.component.html',
  styleUrl: './tracker.component.scss'
})
export class TrackerComponent implements OnInit, OnDestroy {

  user: WritableSignal<UserData> = signal({} as UserData);
  userSubscription: Subscription

  raceType: string = 'miles_3-5';
  time: any = '';
  totalSeconds: number = 0;
  isAverageTime: boolean = true;



  constructor(public storage: StorageService, private auth: AuthService) {
    this.storage.changeTheme();
    this.userSubscription = this.auth.user$.subscribe(user => {
      if (user) {
        console.log('User data received:', user);
        this.user.set(user);
      }
    });
  }

  ngOnInit(): void {
    console.log('TrackerComponent initialized');
  }

  onTimeChange() {
    if (this.time == null || isNaN(this.time)) {
      return;
    }
    const strValue = this.time.toString();
    let totalSeconds: number;
    if (strValue.includes('.')) {
      // If the input is in decimal format (e.g. 38.54)
      // Split into minutes and seconds parts
      const [minutesStr, secondsStr] = strValue.split('.');
      const minutes = parseInt(minutesStr, 10);
      // Ensure seconds are two digits (pad and take only first two digits)
      const seconds = parseInt(secondsStr.padEnd(2, '0').substring(0, 2), 10);
      totalSeconds = minutes * 60 + seconds;
    } else {
      // For whole numbers: if it is 1 or 2 digits, treat it as seconds only.
      // If longer, the last two digits are seconds and the rest are minutes.
      if (strValue.length <= 2) {
        totalSeconds = parseInt(strValue, 10);
      } else {
        const minutesStr = strValue.substring(0, strValue.length - 2);
        const secondsStr = strValue.substring(strValue.length - 2);
        const minutes = parseInt(minutesStr, 10);
        const seconds = parseInt(secondsStr, 10);
        totalSeconds = minutes * 60 + seconds;
      }
    }

    // Now totalSeconds holds the converted value.
    console.log('Converted time in seconds:', totalSeconds);
    this.totalSeconds = totalSeconds;

  }

  onSaveRecord() {
    const user = this.user();
    if (user && user.trackerStats) {
      let stats = user.trackerStats
      if (this.raceType === 'miles_3-5') {
        const tracker = {
          mileSprint: { time: 600, level: 3 },
          oneToThreeMiles: { time: 0, level: 0 },
          threeToFiveMiles: { time: 675, level: 5 },
          fiveToSevenMiles: { time: 0, level: 0 },
          swimPreRun: { time: 690, level: 3 },
          gymPreRun: { time: 0, level: 0 },
          swimRecords: []
        };
        user.trackerStats = tracker;
        this.auth.updateUserData(user);
      }
    } else {
      if (user) {
        console.log('User data is missing trackerStats, initializing...');
        user['trackerStats'] = {
          mileSprint: { time: 600, level: 3 },
          oneToThreeMiles: { time: 0, level: 0 },
          threeToFiveMiles: { time: 675, level: 5 },
          fiveToSevenMiles: { time: 0, level: 0 },
          swimPreRun: { time: 690, level: 3 },
          gymPreRun: { time: 0, level: 0 },
          swimRecords: []
        }
        this.auth.updateUserData(user);
      }
    }
  }

  ngOnDestroy(): void {
    if (this.userSubscription)
      this.userSubscription.unsubscribe();

  }


}
