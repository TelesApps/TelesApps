import { Component, inject, OnDestroy, OnInit, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FireTimeRecordPipe } from '../../shared/pipes/fire-time-record.pipe';
import { TimeRecordPipe } from '../../shared/pipes/time-record.pipe';
import { OrdinalPipe } from '../../shared/pipes/ordinal.pipe';
import { StorageService } from '../../services/storage.service';
import { AuthService } from '../../services/auth.service';
import { RaceType, UserData } from '../../interfaces/user-data.interface';
import { Course, JoggingTracker, Route } from '../../interfaces/tracker.interface';
import { RoutesDialogComponent } from '../../shared/dialogs/routes-dialog/routes-dialog.component';
import { RaceTypeEditDialogComponent } from '../../shared/dialogs/race-type-edit-dialog/race-type-edit-dialog.component';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { routes, createCourses } from '../../../assets/data/running-routes';

@Component({
  selector: 'app-jogging-tracker',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatExpansionModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatDialogModule,
    MatSlideToggleModule,
    FireTimeRecordPipe,
    TimeRecordPipe,
    OrdinalPipe
  ],
  templateUrl: './jogging-tracker.component.html',
  styleUrls: ['./jogging-tracker.component.scss']
})
export class JoggingTrackerComponent implements OnInit, OnDestroy {
  user: WritableSignal<UserData> = signal({} as UserData);
  userSubscription: Subscription;

  course: string = 'lakeRun2x';
  raceType: 'mile_sprint' | 'miles_1-3' | 'miles_3-5' | 'miles_5-7' | 'swim_prerun' | 'gym_prerun' = 'miles_3-5';
  time: any = '';
  totalSeconds: number = 0;
  isTotalTime: boolean = true;
  selectedRoutes: Route[] = [];
  totalDistance: { miles: number, kilometers: number } = { miles: 0, kilometers: 0 };
  secondsPace: { miles: number, kilometers: number } = { miles: 0, kilometers: 0 };

  relevantRecord: RaceType = { slug: '', name: '', time: 0, level: 0 };
  positioningTimer: number = 10;
  currentPosition: number = 1;

  toUpdateRaceType: RaceType = { slug: '', name: '', time: 0, level: 0 };
  isRankingUp: boolean = false;
  isRankingDown: boolean = false;

  routes: Route[] = routes;
  courses: Course[] = createCourses(routes);

  constructor(
    public storage: StorageService,
    private auth: AuthService,
    public dialog: MatDialog
  ) {
    this.userSubscription = this.auth.user$.subscribe(user => {
      if (user) {
        this.user.set(user);
      }
    });
  }

  ngOnInit(): void {
    this.auth.user$.pipe(take(1)).subscribe(() => {
      this.onCourseChange();
    });
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
    if (!isRaceTypeSelection) {
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
        // Update the custom course with the new routes
        const customCourse = this.courses.find(c => c.slug === 'customCourse');
        if (customCourse) {
          customCourse.routes = this.selectedRoutes;
        }
        this.course = 'customCourse';
        this.onCourseChange();
      }
    });
  }

  onRaceTypeChange() {
    // Keep the current selected routes when changing race type
    const currentRoutes = this.selectedRoutes;
    this.course = 'customCourse';
    // Update the custom course with the current routes
    const customCourse = this.courses.find(c => c.slug === 'customCourse');
    if (customCourse) {
      customCourse.routes = currentRoutes;
    }
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
      const [minutesStr, secondsStr] = strValue.split('.');
      const minutes = parseInt(minutesStr, 10);
      const seconds = parseInt(secondsStr.padEnd(2, '0').substring(0, 2), 10);
      totalSeconds = minutes * 60 + seconds;
    } else {
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
        this.secondsPace.miles = this.totalSeconds / miles;
        this.secondsPace.kilometers = this.totalSeconds / kilometers;
      } else {
        this.secondsPace.miles = this.totalSeconds;
        this.secondsPace.kilometers = this.totalSeconds * 1.60934;
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
    // Calculate newLevel based on ranking logic
    let newLevel: number | undefined = undefined;
    let newFirstPlaceTime: number | undefined = undefined;
    
    // If user is ranking up (getting better)
    if (this.isRankingUp) {
      // When ranking up from level 5, new level becomes 2
      newLevel = 2;
      // First place time decreases by positioningTimer
      newFirstPlaceTime = this.relevantRecord.time - this.positioningTimer;
    } 
    // If user is ranking down (getting worse)
    else if (this.isRankingDown) {
      // When ranking down from level 1, new level becomes 5
      newLevel = 5;
      // First place time increases by positioningTimer
      newFirstPlaceTime = this.relevantRecord.time + this.positioningTimer;
    }
    // If user is not changing rank levels but finished in first place
    else if (this.currentPosition === 1 && !this.isRankingUp) {
      // Level goes up by 1, but never exceeds 5
      newLevel = Math.min(this.relevantRecord.level + 1, 5);
      // First place time stays the same
      newFirstPlaceTime = this.relevantRecord.time;
    }
    // If user did not finish in first place and is not ranking down
    else if (this.currentPosition > 1 && !this.isRankingDown) {
      // Level goes down by 1, but never below 1
      newLevel = Math.max(this.relevantRecord.level - 1, 1);
      // First place time stays the same
      newFirstPlaceTime = this.relevantRecord.time;
    }

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
    };
    
    // Add optional fields if they were calculated
    if (newLevel !== undefined) {
      record.newLevel = newLevel;
    }
    
    if (newFirstPlaceTime !== undefined) {
      record.newFirstPlaceTime = newFirstPlaceTime;
    }
    
    return record;
  }

  onSaveRecord() {
    const user = this.user();
    if (user && user.trackerStats) {
      const userStats = user.trackerStats;
      const joggingRecord = this.createNewJoggingRecord(user);
      this.auth.updateRunRecord(user.userId, joggingRecord).then(() => {
      }).catch(error => {
        console.error('Error updating run record:', error);
      });
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

  onEditRaceType(raceType: RaceType): void {
    const dialogRef = this.dialog.open(RaceTypeEditDialogComponent, {
      data: { raceType: { ...raceType } },
      width: '350px'
    });

    dialogRef.afterClosed().pipe(take(1)).subscribe(result => {
      if (result) {
        const user = this.user();
        if (user && user.trackerStats) {
          // Update the race type in the user's stats
          const index = user.trackerStats.raceTypes.findIndex(rt => rt.slug === result.slug);
          if (index !== -1) {
            user.trackerStats.raceTypes[index] = result;
            
            // Save the updated user data
            this.auth.updateUserData(user).then(() => {
              console.log('Race type updated successfully');
              // If the edited race type is the currently selected one, update the relevantRecord
              if (this.raceType === result.slug) {
                this.relevantRecord = result;
                this.onTimeChange();
              }
            }).catch(error => {
              console.error('Error updating race type:', error);
            });
          }
        }
      }
    });
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }
}
