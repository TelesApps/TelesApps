import { Component, inject, OnDestroy, OnInit, signal, WritableSignal } from '@angular/core';
import { StorageService } from '../services/storage.service';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { RaceType, TrackerStats, UserData } from '../interfaces/user-data.interface';
import { AuthService } from '../services/auth.service';
import { lastValueFrom, Subscription, take } from 'rxjs';
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
import { Course, JoggingTracker } from '../interfaces/tracker.interface';
import { Route } from '../interfaces/tracker.interface';
import { MatExpansionModule } from '@angular/material/expansion';
import { OrdinalPipe } from '../shared/pipes/ordinal.pipe';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { RoutesDialogComponent } from '../shared/dialogs/routes-dialog/routes-dialog.component';

@Component({
  selector: 'app-tracker',
  imports: [
    TimeRecordPipe,
    FireTimeRecordPipe,
    OrdinalPipe,
    CommonModule,
    FormsModule,
    MatTabsModule,
    MatCardModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatButtonModule,
    MatExpansionModule,
  ],
  templateUrl: './tracker.component.html',
  styleUrl: './tracker.component.scss'
})
export class TrackerComponent implements OnInit, OnDestroy {

  user: WritableSignal<UserData> = signal({} as UserData);
  userSubscription: Subscription

  course: string = 'lakeRun2x';
  raceType: 'mile_sprint' | 'miles_1-3' | 'miles_3-5' | 'miles_5-7' | 'swim_prerun' | 'gym_prerun' = 'miles_3-5';
  time: any = '';
  totalSeconds: number = 0;
  isTotalTime: boolean = true;
  selectedRoutes: Route[] = [];
  totalDistance: { miles: number, kilometers: number } = { miles: 0, kilometers: 0 };
  secondsPace: { miles: number, kilometers: number } = { miles: 0, kilometers: 0 };

  relevantRecord: RaceType = { slug: '', name: '', time: 0, level: 0 };
  positioningTimer: number = 10; // first second and third placement is determine by every positioningTimer in seconds.
  currentPosition: number = 1;

  toUpdateRaceType: RaceType = { slug: '', name: '', time: 0, level: 0 };
  isRankingUp: boolean = false;
  isRankingDown: boolean = false;
  // rankingUp: { time?: number, level?: number } = {};
  // rankingDown: { time?: number, level?: number } = {};

  // Course definitions are based on https://us.mapometer.com/ 
  routes: Route[] = [
    {
      slug: 'lakeSouthOption',
      name: 'Lake South Option',
      miles: 0.6027,
      kilometers: 0.97,
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
      miles: 1.3680,
      kilometers: 2.20,
    },
    {
      slug: 'straightAway',
      name: 'Straight Away',
      miles: 0.2610,
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
    },
    {
      slug: 'postSwimRunHome',
      name: 'Post Swim Run Home',
      miles: 0.9688,
      kilometers: 1.56,
    },
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
      slug: 'postSwimRunHome',
      name: 'Post Swim Run Home',
      routes: [
        this.routes.find(route => route.slug === 'postSwimRunHome') || this.routes[14]
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
    },
    {
      slug: 'customCourse',
      name: 'Custom Course',
      routes: []
    }
  ]

  constructor(public storage: StorageService, private auth: AuthService, public dialog: MatDialog) {
    this.storage.changeTheme();
    this.userSubscription = this.auth.user$.subscribe(user => {
      if (user) {
        this.user.set(user);
      }
    });
  }

  ngOnInit(): void {
    this.auth.user$.pipe(take(1)).subscribe(user => { this.onCourseChange(); });
  }

  onCourseChange(isRaceTypeSelection: boolean = false) {
    const course = this.courses.find(c => c.slug === this.course);
    if (course) {
      this.selectedRoutes = course.routes;
      this.totalDistance = this.selectedRoutes.reduce((acc, route) => {
        acc.miles += route.miles;
        acc.kilometers += route.kilometers;
        return acc;
      }, { miles: 0, kilometers: 0 });
    }
    if(!isRaceTypeSelection) {
      if (this.totalDistance.miles < 1.01) {
        this.raceType = 'mile_sprint';
        if (this.course === 'postSwimRunHome')
          this.raceType = 'swim_prerun';
      } else if (this.totalDistance.miles < 3) {
        this.raceType = 'miles_1-3';
      } else if (this.totalDistance.miles < 5) {
        this.raceType = 'miles_3-5';
      } else if (this.totalDistance.miles < 7) {
        this.raceType = 'miles_5-7';
      }
    }
    const userData = this.user();
    if (userData && userData.trackerStats && userData.trackerStats.raceTypes) {
      const raceType = userData.trackerStats.raceTypes.find((raceType: RaceType) => raceType.slug === this.raceType);
      this.relevantRecord = raceType || { slug: '', name: '', time: 0, level: 0 };
    }
    this.onTimeChange();
  }

  onOpenCourseDetails() {
    const dialogRef = this.dialog.open(RoutesDialogComponent, {
      data: { routes: this.routes, course: this.course, selectedRoutes: this.selectedRoutes },
    });
    dialogRef.afterClosed().pipe(take(1)).subscribe(result => {
      if (result) {
        this.selectedRoutes = result.selectedRoutes;
        this.totalDistance = result.totalDistance;
        this.course = 'custom';
        this.onCourseChange();
      }
    });
  }

  onRaceTypeChange() {
    this.course = 'custom';
    const relevantRaceType = this.user().trackerStats?.raceTypes.find((raceType: RaceType) => raceType.slug === this.raceType);
    this.relevantRecord = relevantRaceType || this.relevantRecord;
    this.onCourseChange(true);
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
    this.totalSeconds = totalSeconds;
    this.calculatePace();
    this.determineFinishStats();
  }

  calculatePace() {
    if (this.totalSeconds > 0) {
      const miles = this.totalDistance.miles;
      const kilometers = this.totalDistance.kilometers;
      if (this.isTotalTime) {
        // Pace in seconds per mile
        this.secondsPace.miles = this.totalSeconds / miles;
        // Pace in seconds per kilometer
        this.secondsPace.kilometers = this.totalSeconds / kilometers;
      } else {
        // user is inputing the pace per mile, so we just need to calculate what the kilometer average would be
        this.secondsPace.miles = this.totalSeconds;
        this.secondsPace.kilometers = this.totalSeconds * 1.60934; // 1 mile = 1.60934 kilometers (approx)

      }
    } else {
      this.secondsPace.miles = 0;
      this.secondsPace.kilometers = 0;
    }
  }

  determineFinishStats() {
    const userData = this.user();
    let placement = 1;
    if (userData && userData.trackerStats && userData.trackerStats.raceTypes) {
      const userRaceType = userData.trackerStats.raceTypes.find(
        (raceType: RaceType) => raceType.slug === this.raceType
      );
      this.toUpdateRaceType = {
        ...(userRaceType || { slug: '', name: '', time: 0, level: 0 })
      };
      if (this.secondsPace.miles < this.toUpdateRaceType.time) {
        if (this.toUpdateRaceType.level === 5) {
          const difference = this.secondsPace.miles - this.toUpdateRaceType.time;
          const isRankUp = difference <= -this.positioningTimer * 2;
          if (isRankUp) {
            this.isRankingUp = true;
            this.toUpdateRaceType = {
              ...this.toUpdateRaceType,
              level: 2,
              time: this.toUpdateRaceType.time - this.positioningTimer
            }
          } else {
            this.isRankingUp = false;
          }

        } else {
          this.isRankingUp = false;
          this.toUpdateRaceType.level++;
        }
      } else {
        const differene = this.secondsPace.miles - this.toUpdateRaceType.time;
        placement += Math.floor(differene / this.positioningTimer) + 1;
        this.toUpdateRaceType.level--;
        if (this.toUpdateRaceType.level < 1) {
          this.isRankingDown = true;
          this.toUpdateRaceType = {
            ...this.toUpdateRaceType,
            level: 5,
            time: this.toUpdateRaceType.time + this.positioningTimer
          }
        } else {
          this.isRankingDown = false;
        }

      }
    }
    this.currentPosition = placement;
  }

  createNewJoggingRecord(user: UserData): JoggingTracker {
    const record: JoggingTracker = {
      id: '',
      userId: user.userId,
      date: new Date().toISOString(),
      raceType: this.raceType,
      course: this.course,
      routes: this.selectedRoutes,
      distanceMiles: this.totalDistance.miles,
      distanceKilometers: this.totalDistance.kilometers,
      time: this.totalSeconds,
      pace: this.secondsPace.miles,
      firstPlaceTime: this.relevantRecord.time,
      placement: this.currentPosition,
      currentLevel: this.relevantRecord.level
    }
    return record;

  }

  onSaveRecord() {
    const user = this.user();
    if (user && user.trackerStats) {
      const userStats = user.trackerStats;
      const joggingRecord = this.createNewJoggingRecord(user);
      // Update records in firebase
      this.auth.updateRunRecord(user.userId, joggingRecord).then(() => {
      }).catch(error => {
        console.error('Error updating run record:', error);
      });
      // Update user stats in firebase
      userStats.raceTypes.forEach(raceType => {
        if (raceType.slug === this.toUpdateRaceType.slug) {
          raceType.time = this.toUpdateRaceType.time;
          raceType.level = this.toUpdateRaceType.level;
        }
      });
      this.resetForm();
      this.auth.updateUserData(user).then(() => {
        this.onCourseChange();
      }).catch(error => {
        console.error('Error initializing trackerStats:', error);
      });
      // Reset the form and relevant variables

    } else {
      if (user) {
        user['trackerStats'] = {
          raceTypes: [
            { slug: 'mile_sprint', name: 'Mile Sprint', time: 0, level: 2 },
            { slug: 'miles_1-3', name: '1-3 Miles', time: 0, level: 2 },
            { slug: 'miles_3-5', name: '3-5 Miles', time: 0, level: 2 },
            { slug: 'miles_5-7', name: '5-7 Miles', time: 0, level: 2 },
            { slug: 'swim_prerun', name: 'Swim PreRun', time: 0, level: 2 },
            { slug: 'gym_prerun', name: 'Gym PreRun', time: 0, level: 2 }
          ],
          swimRecords: []
        }
        this.auth.updateUserData(user).then(() => {
          this.onCourseChange();
        }).catch(error => {
          console.error('Error initializing trackerStats:', error);
        });
      }
    }
  }

  resetForm() {
    this.time = '';
    this.totalSeconds = 0;
    this.isTotalTime = true;
    this.selectedRoutes = [];
    this.totalDistance = { miles: 0, kilometers: 0 };
    this.secondsPace = { miles: 0, kilometers: 0 };
    this.relevantRecord = { slug: '', name: '', time: 0, level: 0 };
    this.toUpdateRaceType = { slug: '', name: '', time: 0, level: 0 };
    this.isRankingUp = false;
    this.isRankingDown = false;
  }

  ngOnDestroy(): void {
    if (this.userSubscription)
      this.userSubscription.unsubscribe();

  }


}
