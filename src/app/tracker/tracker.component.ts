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
import { Course } from '../interfaces/tracker.interface';
import { Route } from '../interfaces/tracker.interface';

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

  course: string = 'lakeRun2x';
  raceType: string = 'miles_3-5';
  time: any = '';
  totalSeconds: number = 0;
  isTotalTime: boolean = true;
  selectedRoutes: Route[] = [];
  totalDistance: { miles: number, kilometers: number } = { miles: 0, kilometers: 0 };

  // Course definitions are based on https://us.mapometer.com/ 
  routes: Route[] = [
    {
      slug: 'lakeSouthOption',
      name: 'Lake South Option',
      miles: 0.4846,
      kilometers: 0.78,
    },
    {
      slug: 'lakeMainStart',
      name: 'Lake Main Start',
      miles: 0.3168,
      kilometers: 0.51,
    },
    {
      slug: 'lakeLoop',
      name: 'Lake Loop',
      miles: 1.3670,
      kilometers: 2.20,
    },
    {
      slug: 'straightAway',
      name: 'Straight Away',
      miles: 0.2609,
      kilometers: 0.42,
    },
    {
      slug: 'hospitalRunToGladys',
      name: 'Hospital Run to Gladys',
      miles: 1.9573,
      kilometers: 3.15,
    },
    {
      slug: 'hospitalRunToGym',
      name: 'Hospital Run to Gym',
      miles: 2.3674,
      kilometers: 3.81,
    },
    {
      slug: 'gymToHome',
      name: 'Gym to Home',
      miles: 1.0625,
      kilometers: 1.71,
    },
    {
      slug: 'gladysToHome',
      name: 'Gladys to Home',
      miles: 0.6648,
      kilometers: 1.07,
    },
    {
      slug: 'gladysToSouthOption',
      name: 'Gladys to South Option',
      miles: 0.7270,
      kilometers: 1.17,
    },
    {
      slug: 'gymToSouthOption',
      name: 'Gym to South Option',
      miles: 1.1246,
      kilometers: 1.81,
    },
    {
      slug: 'gymToLakeMainStart',
      name: 'Gym to Lake Main Start',
      miles: 1.1246,
      kilometers: 1.81,
    },
    {
      slug: 'gladysToLakeMainStart',
      name: 'Gladys to Lake Main Start',
      miles: 0.6648,
      kilometers: 1.07,
    },
    {
      slug: 'adrianDaleToSouthOption',
      name: 'Adrian Dale to South Option',
      miles: 1.0563,
      kilometers: 1.70,
    },
    {
      slug: 'mileSprint',
      name: 'Mile Sprint',
      miles: 1.0,
      kilometers: 1.62,
    }
  ]
  
  courses: Course[] = [
    {
      slug: 'mileSprint',
      name: 'Mile Sprint',
      routes: [
        this.routes.find(route => route.slug === 'mileSprint') || this.routes[12]
      ]
    },
    {
      slug: 'lakeRun1x',
      name: 'Lake Run 1x',
      routes: [
        this.routes.find(route => route.slug === 'lakeMainStart') || this.routes[1],
        this.routes.find(route => route.slug === 'lakeLoop') || this.routes[2],
        this.routes.find(route => route.slug === 'straightAway') || this.routes[3],
      ]
    },
    {
      slug: 'lakeRun2x',
      name: 'Lake Run 2x',
      routes: [
        this.routes.find(route => route.slug === 'lakeMainStart') || this.routes[1],
        this.routes.find(route => route.slug === 'lakeLoop') || this.routes[2],
        this.routes.find(route => route.slug === 'lakeLoop') || this.routes[2],
        this.routes.find(route => route.slug === 'straightAway') || this.routes[3],
      ]
    },
    {
      slug: 'lake2xSOption',
      name: 'Lake 2x S Option',
      routes: [
        this.routes.find(route => route.slug === 'lakeSouthOption') || this.routes[0],
        this.routes.find(route => route.slug === 'lakeLoop') || this.routes[2],
        this.routes.find(route => route.slug === 'lakeLoop') || this.routes[2],
        this.routes.find(route => route.slug === 'straightAway') || this.routes[3],
      ]
    },
    {
      slug: 'lakeRun3x',
      name: 'Lake Run 3x',
      routes: [
        this.routes.find(route => route.slug === 'lakeMainStart') || this.routes[1],
        this.routes.find(route => route.slug === 'lakeLoop') || this.routes[2],
        this.routes.find(route => route.slug === 'lakeLoop') || this.routes[2],
        this.routes.find(route => route.slug === 'lakeLoop') || this.routes[2],
        this.routes.find(route => route.slug === 'straightAway') || this.routes[3],
      ]
    },
    {
      slug: 'lake3xSOption',
      name: 'Lake 3x S Option',
      routes: [
        this.routes.find(route => route.slug === 'lakeSouthOption') || this.routes[0],
        this.routes.find(route => route.slug === 'lakeLoop') || this.routes[2],
        this.routes.find(route => route.slug === 'lakeLoop') || this.routes[2],
        this.routes.find(route => route.slug === 'lakeLoop') || this.routes[2],
        this.routes.find(route => route.slug === 'straightAway') || this.routes[3],
      ]
    },
    {
      slug: 'hospitalRun',
      name: 'Hospital Run',
      routes: [
        this.routes.find(route => route.slug === 'hospitalRunToGladys') || this.routes[4],
        this.routes.find(route => route.slug === 'gladysToHome') || this.routes[7],
      ]
    },
    {
      slug: 'hospitalGymRun',
      name: 'Hospital Gym Run',
      routes: [
        this.routes.find(route => route.slug === 'hospitalRunToGym') || this.routes[5],
        this.routes.find(route => route.slug === 'gymToHome') || this.routes[6],
      ]
    },
    {
      slug: 'adriandaleLakeRun',
      name: 'Adrian Dale Lake Run',
      routes: [
        this.routes.find(route => route.slug === 'adrianDaleToSouthOption') || this.routes[13],
        this.routes.find(route => route.slug === 'lakeSouthOption') || this.routes[0],
        this.routes.find(route => route.slug === 'lakeLoop') || this.routes[2],
        this.routes.find(route => route.slug === 'straightAway') || this.routes[3],
      ]
    }
  ]

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
    this.onCourseChange();
  }

  onCourseChange() {
    const course = this.courses.find(c => c.slug === this.course);
    if (course) {
      this.selectedRoutes = course.routes;
      this.totalDistance = this.selectedRoutes.reduce((acc, route) => {
        acc.miles += route.miles;
        acc.kilometers += route.kilometers;
        return acc;
      }, { miles: 0, kilometers: 0 });
    }
    if (this.totalDistance.miles < 1) {
      this.raceType = 'mile_sprint';
    } else if (this.totalDistance.miles < 3) {
      this.raceType = 'miles_1-3';
    } else if (this.totalDistance.miles < 5) {
      this.raceType = 'miles_3-5';
    } else if (this.totalDistance.miles < 7) {
      this.raceType = 'miles_5-7';
    }
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
