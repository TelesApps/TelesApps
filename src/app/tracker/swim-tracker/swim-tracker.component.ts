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

  swimType: string = 'largo_pool_40_laps';
  laps: number = 0;
  time: any = '';
  totalSeconds: number = 0;
  totalDistance: number = 0; // in meters
  secondsPerLap: number = 0;

  relevantRecord: SwimType = { location: '', slug: '', lapLength: 0, requiredLaps: 0, firstPlaceTime: 0, currentLevel: 0 };
  currentPosition: number = 1;

  // Add positioning timer
  positioningTimer: number = 60;
  isRankingUp: boolean = false;
  isRankingDown: boolean = false;
  toUpdateSwimType: SwimType = { location: '', slug: '', lapLength: 0, requiredLaps: 0, firstPlaceTime: 0, currentLevel: 0 };

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

  onSwimTypeChange() {
    const userData = this.user();
    if (userData && userData.trackerStats && userData.trackerStats.swimTypes) {
      const swimType = userData.trackerStats.swimTypes.find((type: SwimType) => type.slug === this.swimType);
      this.relevantRecord = swimType || { location: '', slug: '', lapLength: 0, requiredLaps: 0, firstPlaceTime: 0, currentLevel: 0 };
      
      // Automatically set the number of laps to the required laps of the selected swim type
      this.laps = this.relevantRecord.requiredLaps;
      
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
      this.secondsPerLap = this.totalSeconds / this.laps;
    } else {
      this.secondsPerLap = 0;
    }
  }

  determineFinishStats() {
    const userData = this.user();
    if (!userData || !userData.trackerStats || !this.relevantRecord || this.totalSeconds <= 0) {
      this.currentPosition = 1;
      this.isRankingUp = false;
      this.isRankingDown = false;
      return;
    }

    // Reset ranking flags
    this.isRankingUp = false;
    this.isRankingDown = false;

    // Initialize toUpdateSwimType
    this.toUpdateSwimType = { ...this.relevantRecord };

    if (this.relevantRecord.firstPlaceTime > 0) {
      // Calculate position based on positioning timer (every 10 seconds difference)
      const timeDifference = this.totalSeconds - this.relevantRecord.firstPlaceTime;
      this.currentPosition = Math.max(1, Math.ceil(timeDifference / this.positioningTimer) + 1);

      // Determine if user is ranking up or down
      if (this.currentPosition === 1) {
        if (this.totalSeconds < this.relevantRecord.firstPlaceTime) {
          // User beat the first place time
          this.isRankingUp = true;
          this.toUpdateSwimType.firstPlaceTime = this.totalSeconds;
          this.toUpdateSwimType.currentLevel = 2; // Reset to level 2 when ranking up
        } else if (this.relevantRecord.currentLevel < 5) {
          // First place but didn't beat the time - level up normally
          this.toUpdateSwimType.currentLevel = Math.min(5, this.relevantRecord.currentLevel + 1);
        }
      } else if (this.currentPosition > 1) {
        if (timeDifference > this.positioningTimer * 5) {
          // Significantly slower time - ranking down
          this.isRankingDown = true;
          this.toUpdateSwimType.firstPlaceTime = this.totalSeconds;
          this.toUpdateSwimType.currentLevel = 5; // Reset to level 5 when ranking down
        } else {
          // Normal level down
          this.toUpdateSwimType.currentLevel = Math.max(1, this.relevantRecord.currentLevel - 1);
        }
      }
    } else {
      // If no first place time exists, this becomes the first place time
      this.currentPosition = 1;
      this.toUpdateSwimType.firstPlaceTime = this.totalSeconds;
      this.toUpdateSwimType.currentLevel = Math.min(5, this.relevantRecord.currentLevel + 1);
    }
  }

  createNewSwimRecord(user: UserData): SwimRecord {
    const record: SwimRecord = {
      id: '',
      userId: user.userId,
      date: new Date().toISOString(),
      swimLocation: this.relevantRecord.location,
      swimType: this.relevantRecord,
      laps: this.laps,
      time: this.totalSeconds,
      timePerLap: this.secondsPerLap,
      currentLevel: this.relevantRecord.currentLevel,
      // Add new fields for tracking level and time changes
      newLevel: this.toUpdateSwimType.currentLevel,
      newFirstPlaceTime: this.toUpdateSwimType.firstPlaceTime
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
      
      // Update user stats if there are changes
      const swimTypeIndex = userData.trackerStats?.swimTypes.findIndex(
        type => type.slug === this.relevantRecord.slug
      );
      
      if (swimTypeIndex !== undefined && swimTypeIndex >= 0 && userData.trackerStats) {
        const user = { ...userData };
        if (user.trackerStats) {
          user.trackerStats.swimTypes[swimTypeIndex] = {
            ...user.trackerStats.swimTypes[swimTypeIndex],
            firstPlaceTime: this.toUpdateSwimType.firstPlaceTime,
            currentLevel: this.toUpdateSwimType.currentLevel
          };
          
          // Update user data
          this.auth.updateUserData(user);
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
