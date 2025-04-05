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
import { SwimType, UserData } from '../../interfaces/user-data.interface';
import { SwimRecord } from '../../interfaces/tracker.interface';
import { RaceTypeEditDialogComponent } from '../../shared/dialogs/race-type-edit-dialog/race-type-edit-dialog.component';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-swim-tracker',
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
  templateUrl: './swim-tracker.component.html',
  styleUrls: ['./swim-tracker.component.scss']
})
export class SwimTrackerComponent implements OnInit, OnDestroy {
  user: WritableSignal<UserData> = signal({} as UserData);
  userSubscription: Subscription;

  Math = Math;

  swimType: string = 'largo_pool';
  laps: number = 0;
  time: any = '';
  totalSeconds: number = 0;
  isTotalTime: boolean = true;
  totalDistance: number = 0; // in meters
  secondsPerLap: number = 0;

  relevantRecord: SwimType = { location: '', slug: '', lapLength: 0, requiredLaps: 0, firstPlaceTime: 0, currentLevel: 0 };
  currentPosition: number = 1;

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
      this.onSwimTypeChange();
    });
  }

  testSaveRecord() {
    const userData = this.user();
    if (userData) {
      if (userData.trackerStats && userData.trackerStats.swimTypes && userData.trackerStats.swimTypes.length > 0) {
        console.log(userData.trackerStats.swimTypes);
      } else {
        console.log('No swim types found in user data.');
        const swimTypes: SwimType[] = [
          { location: 'Largo Community Pool', slug: 'largo_pool_20_laps', lapLength: 25, requiredLaps: 20, firstPlaceTime: 0, currentLevel: 0 },
          { location: 'Largo Community Pool', slug: 'largo_pool_30_laps', lapLength: 25, requiredLaps: 30, firstPlaceTime: 0, currentLevel: 0 },
          { location: 'Largo Community Pool', slug: 'largo_pool_40_laps', lapLength: 25, requiredLaps: 40, firstPlaceTime: 0, currentLevel: 0 },
          { location: 'Largo Community Pool', slug: 'largo_pool_50_laps', lapLength: 25, requiredLaps: 50, firstPlaceTime: 0, currentLevel: 0 },
          { location: 'Largo Community Pool', slug: 'largo_pool_60_laps', lapLength: 25, requiredLaps: 60, firstPlaceTime: 0, currentLevel: 0 },
          { location: 'Largo Community Pool', slug: 'largo_pool_70_laps', lapLength: 25, requiredLaps: 70, firstPlaceTime: 0, currentLevel: 0 },
          { location: 'Largo Community Pool', slug: 'largo_pool_80_laps', lapLength: 25, requiredLaps: 80, firstPlaceTime: 0, currentLevel: 0 },
          { location: 'Largo Community Pool', slug: 'largo_pool_90_laps', lapLength: 25, requiredLaps: 90, firstPlaceTime: 0, currentLevel: 0 },
          { location: 'Largo Community Pool', slug: 'largo_pool_100_laps', lapLength: 25, requiredLaps: 100, firstPlaceTime: 0, currentLevel: 0 }

      
        ];
        userData.trackerStats?.swimTypes.push(...swimTypes);
        this.auth.updateUserData(userData).then(() => {
          console.log('User data updated successfully.');
        }).catch((error) => {
          console.error('Error updating user data:', error);
        });

      }
    }

  }

  onSwimTypeChange() {
    const userData = this.user();
    if (userData && userData.trackerStats && userData.trackerStats.swimTypes) {
      const swimType = userData.trackerStats.swimTypes.find((type: SwimType) => type.slug === this.swimType);
      this.relevantRecord = swimType || { location: '', slug: '', lapLength: 0, requiredLaps: 0, firstPlaceTime: 0, currentLevel: 0 };
      this.calculateDistance();
    }
    this.onTimeChange();
  }

  onLapsChange() {
    this.calculateDistance();
    this.onTimeChange();
  }

  calculateDistance() {
    if (this.relevantRecord && this.laps > 0) {
      this.totalDistance = this.laps * this.relevantRecord.lapLength;
    } else {
      this.totalDistance = 0;
    }
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
    this.calculateTimePerLap();
    this.determineFinishStats();
  }

  calculateTimePerLap() {
    if (this.totalSeconds > 0 && this.laps > 0) {
      if (this.isTotalTime) {
        this.secondsPerLap = this.totalSeconds / this.laps;
      } else {
        this.secondsPerLap = this.totalSeconds;
      }
    } else {
      this.secondsPerLap = 0;
    }
  }

  determineFinishStats() {
    const userData = this.user();
    if (!userData || !userData.trackerStats || !this.relevantRecord || this.totalSeconds <= 0) {
      this.currentPosition = 1;
      return;
    }

    // Calculate position based on how close to first place time
    if (this.relevantRecord.firstPlaceTime > 0) {
      // Every 10 seconds difference is a placement point
      const timeDifference = this.totalSeconds - this.relevantRecord.firstPlaceTime;
      this.currentPosition = Math.max(1, Math.ceil(timeDifference / 10) + 1);
    } else {
      // If no first place time set, this is first place
      this.currentPosition = 1;
    }
  }

  createNewSwimRecord(user: UserData): SwimRecord {
    const swimType = user.trackerStats?.swimTypes.find(type => type.slug === this.swimType);

    const record: SwimRecord = {
      id: '',
      userId: user.userId,
      date: new Date().toISOString(),
      swimLocation: swimType?.location || '',
      swimType: swimType || this.relevantRecord,
      laps: this.laps,
      time: this.totalSeconds,
      timePerLap: this.secondsPerLap,
      currentLevel: swimType?.currentLevel || 0
    };

    return record;
  }

  onSaveRecord() {
    if (!this.swimType || !this.time || this.laps <= 0) {
      return;
    }

    const userData = this.user();
    if (!userData) {
      return;
    }

    // Create new record
    const record = this.createNewSwimRecord(userData);

    // Save to database
    this.auth.updateSwimRecord(record).then(() => {
      console.log('Swim record saved successfully');

      // Update user stats if this is a better time
      if (this.currentPosition === 1 && this.relevantRecord.slug) {
        const swimTypeIndex = userData.trackerStats?.swimTypes.findIndex(
          type => type.slug === this.relevantRecord.slug
        );

        if (swimTypeIndex !== undefined && swimTypeIndex >= 0) {
          const user = { ...userData };
          if (user.trackerStats && user.trackerStats.swimTypes) {
            user.trackerStats.swimTypes[swimTypeIndex].firstPlaceTime = this.totalSeconds;

            // Update level based on performance
            const previousLevel = user.trackerStats.swimTypes[swimTypeIndex].currentLevel;
            user.trackerStats.swimTypes[swimTypeIndex].currentLevel = Math.min(5, previousLevel + 1);

            // Update user data
            this.auth.updateUserData(user);
          }
        }
      }

      // Reset form
      this.resetForm();
    });
  }

  resetForm() {
    this.time = '';
    this.totalSeconds = 0;
    this.laps = 0;
    this.isTotalTime = true;
    this.totalDistance = 0;
    this.secondsPerLap = 0;
    this.relevantRecord = { location: '', slug: '', lapLength: 0, requiredLaps: 0, firstPlaceTime: 0, currentLevel: 0 };
  }

  onEditSwimType(swimType: SwimType): void {
    const dialogRef = this.dialog.open(RaceTypeEditDialogComponent, {
      data: {
        raceType: {
          slug: swimType.slug,
          name: `${swimType.location} (${swimType.requiredLaps} laps)`,
          time: swimType.firstPlaceTime,
          level: swimType.currentLevel
        }
      },
      width: '350px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Update the user's swim type data
        const user = { ...this.user() };
        if (user.trackerStats) {
          const index = user.trackerStats.swimTypes.findIndex(type => type.slug === swimType.slug);
          if (index !== -1) {
            user.trackerStats.swimTypes[index].firstPlaceTime = result.time;
            user.trackerStats.swimTypes[index].currentLevel = result.level;

            // Save the updated user
            this.auth.updateUserData(user);

            // Update current UI if this is the selected swim type
            if (this.swimType === swimType.slug) {
              this.relevantRecord = user.trackerStats.swimTypes[index];
              this.onTimeChange();
            }
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
