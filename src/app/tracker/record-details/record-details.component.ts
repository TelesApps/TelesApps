import { Component, OnInit, OnDestroy, inject, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
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
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { FireTimeRecordPipe } from '../../shared/pipes/fire-time-record.pipe';
import { TimeRecordPipe } from '../../shared/pipes/time-record.pipe';
import { OrdinalPipe } from '../../shared/pipes/ordinal.pipe';
import { StorageService } from '../../services/storage.service';
import { AuthService } from '../../services/auth.service';
import { UserData } from '../../interfaces/user-data.interface';
import { JoggingRecord, SwimRecord } from '../../interfaces/tracker.interface';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-record-details',
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
    MatDatepickerModule,
    MatNativeDateModule,
    MatTooltipModule,
    FireTimeRecordPipe,
    TimeRecordPipe,
    OrdinalPipe
  ],
  templateUrl: './record-details.component.html',
  styleUrls: ['./record-details.component.scss']
})
export class RecordDetailsComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);
  public dialog = inject(MatDialog);
  public storage = inject(StorageService);

  Math = Math; // Make Math available in template

  user: WritableSignal<UserData> = signal({} as UserData);
  userSubscription: Subscription;
  
  record: JoggingRecord | SwimRecord | null = null;
  isLoading = true;
  error: string | null = null;
  sourceTabIndex: number = 1; // Default to jogging records tab
  recordType: 'jogging' | 'swim' = 'jogging'; // Track record type

  // Edit mode tracking
  editModes: { [key: string]: boolean } = {
    date: false,
    distance: false,
    time: false,
    pace: false,
    firstPlaceTime: false,
    placement: false,
    currentLevel: false,
    newLevel: false,
    laps: false,
    timePerLap: false
  };
  
  // Temporary values for editing
  tempValues: { [key: string]: any } = {};
  
  // Time input values for different fields
  timeInputs: { [key: string]: string } = {
    time: '',
    pace: '',
    firstPlaceTime: '',
    timePerLap: ''
  };

  // Type guards for template
  isJoggingRecord(record: JoggingRecord | SwimRecord | null): record is JoggingRecord {
    return record !== null && this.recordType === 'jogging';
  }

  isSwimRecord(record: JoggingRecord | SwimRecord | null): record is SwimRecord {
    return record !== null && this.recordType === 'swim';
  }

  // Getters for template to avoid type errors
  get joggingRecord(): JoggingRecord | null {
    return this.isJoggingRecord(this.record) ? this.record : null;
  }

  get swimRecord(): SwimRecord | null {
    return this.isSwimRecord(this.record) ? this.record : null;
  }

  constructor() {
    this.userSubscription = this.authService.user$.subscribe(user => {
      if (user) {
        this.user.set(user);
      }
    });
  }

  ngOnInit() {
    // Get the record ID from the route parameters
    this.route.params.pipe(take(1)).subscribe(params => {
      const recordId = params['id'];
      if (recordId) {
        this.loadRecord(recordId);
      }
    });

    // Get the source tab index from query params
    this.route.queryParams.pipe(take(1)).subscribe(params => {
      this.sourceTabIndex = parseInt(params['sourceTab'] || '1', 10);
    });
  }

  private loadRecord(recordId: string) {
    // Check if we are on the swim record route
    const isSwimRecord = this.router.url.includes('swim-record');
    this.recordType = isSwimRecord ? 'swim' : 'jogging';
    
    this.authService.user$.pipe(take(1)).subscribe(user => {
      if (user) {
        if (isSwimRecord) {
          // Load swim record
          this.authService.getUserSwimRecords(user.userId).pipe(take(1)).subscribe(records => {
            const record = records.find(r => r.id === recordId);
            if (record) {
              this.record = record;
              this.resetTempValues();
            } else {
              this.error = 'Swim record not found';
            }
            this.isLoading = false;
          });
        } else {
          // Load jogging record
          this.authService.getUserRunRecords(user.userId).pipe(take(1)).subscribe(records => {
            const record = records.find(r => r.id === recordId);
            if (record) {
              this.record = record;
              this.resetTempValues();
            } else {
              this.error = 'Jogging record not found';
            }
            this.isLoading = false;
          });
        }
      }
    });
  }

  // Helper methods for template
  isLevelUp(): boolean {
    if (!this.record || this.record.newLevel === undefined || this.record.currentLevel === undefined) {
      return false;
    }
    return this.record.newLevel > this.record.currentLevel;
  }

  isLevelDown(): boolean {
    if (!this.record || this.record.newLevel === undefined || this.record.currentLevel === undefined) {
      return false;
    }
    return this.record.newLevel < this.record.currentLevel;
  }

  resetTempValues() {
    if (!this.record) return;
    
    if (this.recordType === 'jogging') {
      const joggingRecord = this.record as JoggingRecord;
      this.tempValues = {
        date: new Date(joggingRecord.date),
        distanceMiles: joggingRecord.distanceMiles,
        distanceKilometers: joggingRecord.distanceKilometers,
        time: joggingRecord.time,
        pace: joggingRecord.pace,
        firstPlaceTime: joggingRecord.firstPlaceTime,
        placement: joggingRecord.placement,
        currentLevel: joggingRecord.currentLevel,
        newLevel: joggingRecord.newLevel
      };
      
      // Format time values for display
      if (joggingRecord.time) {
        const minutes = Math.floor(joggingRecord.time / 60);
        const seconds = Math.round(joggingRecord.time % 60);
        this.timeInputs['time'] = `${minutes}.${seconds.toString().padStart(2, '0')}`;
      }
      
      if (joggingRecord.pace) {
        const minutes = Math.floor(joggingRecord.pace / 60);
        const seconds = Math.round(joggingRecord.pace % 60);
        this.timeInputs['pace'] = `${minutes}.${seconds.toString().padStart(2, '0')}`;
      }
      
      if (joggingRecord.firstPlaceTime) {
        const minutes = Math.floor(joggingRecord.firstPlaceTime / 60);
        const seconds = Math.round(joggingRecord.firstPlaceTime % 60);
        this.timeInputs['firstPlaceTime'] = `${minutes}.${seconds.toString().padStart(2, '0')}`;
      }
    } else {
      // Swim record
      const swimRecord = this.record as SwimRecord;
      this.tempValues = {
        date: new Date(swimRecord.date),
        laps: swimRecord.laps,
        time: swimRecord.time,
        timePerLap: swimRecord.timePerLap,
        currentLevel: swimRecord.currentLevel,
        newLevel: swimRecord.newLevel
      };
      
      // Format time values for display
      if (swimRecord.time) {
        const minutes = Math.floor(swimRecord.time / 60);
        const seconds = Math.round(swimRecord.time % 60);
        this.timeInputs['time'] = `${minutes}.${seconds.toString().padStart(2, '0')}`;
      }
      
      if (swimRecord.timePerLap) {
        const minutes = Math.floor(swimRecord.timePerLap / 60);
        const seconds = Math.round(swimRecord.timePerLap % 60);
        this.timeInputs['timePerLap'] = `${minutes}.${seconds.toString().padStart(2, '0')}`;
      }
      
      if (swimRecord.swimType && swimRecord.swimType.firstPlaceTime) {
        const minutes = Math.floor(swimRecord.swimType.firstPlaceTime / 60);
        const seconds = Math.round(swimRecord.swimType.firstPlaceTime % 60);
        this.timeInputs['firstPlaceTime'] = `${minutes}.${seconds.toString().padStart(2, '0')}`;
      }
    }
  }

  toggleEdit(field: string) {
    // Reset all edit modes first
    if (!this.editModes[field]) {
      Object.keys(this.editModes).forEach(key => {
        this.editModes[key] = false;
      });
    }
    
    // Toggle the specified field
    this.editModes[field] = !this.editModes[field];
    
    // Reset temp value when starting to edit
    if (this.editModes[field]) {
      this.resetTempValues();
    }
  }

  saveField(field: string) {
    if (!this.record) return;
    
    if (this.recordType === 'jogging') {
      const joggingRecord = this.record as JoggingRecord;
      
      switch (field) {
        case 'date':
          if (this.tempValues['date']) {
            joggingRecord.date = new Date(this.tempValues['date']).toISOString();
          }
          break;
          
        case 'distance':
          if (this.tempValues['distanceMiles']) {
            joggingRecord.distanceMiles = parseFloat(this.tempValues['distanceMiles']);
            // Auto-calculate kilometers
            joggingRecord.distanceKilometers = joggingRecord.distanceMiles * 1.60934;
          }
          break;
          
        case 'time':
          if (this.timeInputs['time']) {
            const totalSeconds = this.parseTimeInput(this.timeInputs['time']);
            if (totalSeconds > 0) {
              joggingRecord.time = totalSeconds;
              // Auto-update pace if distance is available
              if (joggingRecord.distanceMiles > 0) {
                joggingRecord.pace = totalSeconds / joggingRecord.distanceMiles;
                // Update pace input value
                const minutes = Math.floor(joggingRecord.pace / 60);
                const seconds = Math.round(joggingRecord.pace % 60);
                this.timeInputs['pace'] = `${minutes}.${seconds.toString().padStart(2, '0')}`;
              }
            }
          }
          break;
          
        case 'pace':
          if (this.timeInputs['pace']) {
            const paceSeconds = this.parseTimeInput(this.timeInputs['pace']);
            if (paceSeconds > 0) {
              joggingRecord.pace = paceSeconds;
              // Auto-update time if distance is available
              if (joggingRecord.distanceMiles > 0) {
                joggingRecord.time = paceSeconds * joggingRecord.distanceMiles;
                // Update time input value
                const minutes = Math.floor(joggingRecord.time / 60);
                const seconds = Math.round(joggingRecord.time % 60);
                this.timeInputs['time'] = `${minutes}.${seconds.toString().padStart(2, '0')}`;
              }
            }
          }
          break;
          
        case 'firstPlaceTime':
          if (this.timeInputs['firstPlaceTime']) {
            const firstPlaceSeconds = this.parseTimeInput(this.timeInputs['firstPlaceTime']);
            if (firstPlaceSeconds > 0) {
              joggingRecord.firstPlaceTime = firstPlaceSeconds;
            }
          }
          break;
          
        case 'placement':
          if (this.tempValues['placement'] !== undefined) {
            const placement = parseInt(this.tempValues['placement'], 10);
            if (!isNaN(placement)) {
              joggingRecord.placement = placement;
            }
          }
          break;
          
        case 'currentLevel':
          if (this.tempValues['currentLevel'] !== undefined) {
            const level = parseInt(this.tempValues['currentLevel'], 10);
            if (!isNaN(level) && level >= 1 && level <= 5) {
              joggingRecord.currentLevel = level;
            }
          }
          break;
          
        case 'newLevel':
          if (this.tempValues['newLevel'] !== undefined) {
            const level = parseInt(this.tempValues['newLevel'], 10);
            if (!isNaN(level) && level >= 1 && level <= 5) {
              joggingRecord.newLevel = level;
            }
          }
          break;
      }
    } else {
      // Handle swim record
      const swimRecord = this.record as SwimRecord;
      
      switch (field) {
        case 'date':
          if (this.tempValues['date']) {
            swimRecord.date = new Date(this.tempValues['date']).toISOString();
          }
          break;
          
        case 'laps':
          if (this.tempValues['laps']) {
            const laps = parseInt(this.tempValues['laps'], 10);
            if (!isNaN(laps) && laps > 0) {
              swimRecord.laps = laps;
              // Auto-update time per lap if time is available
              if (swimRecord.time > 0) {
                swimRecord.timePerLap = swimRecord.time / laps;
              }
            }
          }
          break;
          
        case 'time':
          if (this.timeInputs['time']) {
            const totalSeconds = this.parseTimeInput(this.timeInputs['time']);
            if (totalSeconds > 0) {
              swimRecord.time = totalSeconds;
              // Auto-update time per lap if laps is available
              if (swimRecord.laps > 0) {
                swimRecord.timePerLap = totalSeconds / swimRecord.laps;
              }
            }
          }
          break;
          
        case 'timePerLap':
          if (this.timeInputs['timePerLap']) {
            const timePerLapSeconds = this.parseTimeInput(this.timeInputs['timePerLap']);
            if (timePerLapSeconds > 0) {
              swimRecord.timePerLap = timePerLapSeconds;
              // Auto-update total time if laps is available
              if (swimRecord.laps > 0) {
                swimRecord.time = timePerLapSeconds * swimRecord.laps;
                // Update time input value
                const minutes = Math.floor(swimRecord.time / 60);
                const seconds = Math.round(swimRecord.time % 60);
                this.timeInputs['time'] = `${minutes}.${seconds.toString().padStart(2, '0')}`;
              }
            }
          }
          break;
          
        case 'currentLevel':
          if (this.tempValues['currentLevel'] !== undefined) {
            const level = parseInt(this.tempValues['currentLevel'], 10);
            if (!isNaN(level) && level >= 1 && level <= 5) {
              swimRecord.currentLevel = level;
            }
          }
          break;
          
        case 'newLevel':
          if (this.tempValues['newLevel'] !== undefined) {
            const level = parseInt(this.tempValues['newLevel'], 10);
            if (!isNaN(level) && level >= 1 && level <= 5) {
              swimRecord.newLevel = level;
            }
          }
          break;
      }
    }
    
    // Save to database
    this.saveRecord();
    
    // Toggle off edit mode
    this.editModes[field] = false;
  }

  cancelEdit(field: string) {
    this.editModes[field] = false;
    this.resetTempValues();
  }

  parseTimeInput(timeStr: string): number {
    if (!timeStr || isNaN(Number(timeStr.replace('.', '')))) return 0;
    
    const strValue = timeStr.toString();
    let totalSeconds: number;
    
    if (strValue.includes('.')) {
      const [minutesStr, secondsStr] = strValue.split('.');
      const minutes = parseInt(minutesStr, 10) || 0;
      const seconds = parseInt(secondsStr.padEnd(2, '0').substring(0, 2), 10) || 0;
      totalSeconds = minutes * 60 + seconds;
    } else {
      if (strValue.length <= 2) {
        totalSeconds = parseInt(strValue, 10) || 0;
      } else {
        const minutesStr = strValue.substring(0, strValue.length - 2);
        const secondsStr = strValue.substring(strValue.length - 2);
        const minutes = parseInt(minutesStr, 10) || 0;
        const seconds = parseInt(secondsStr, 10) || 0;
        totalSeconds = minutes * 60 + seconds;
      }
    }
    
    return totalSeconds;
  }

  saveRecord() {
    if (!this.record) return;
    
    if (this.recordType === 'jogging') {
      // Update jogging record
      this.authService.updateRunRecord(this.record as JoggingRecord).then(() => {
        // Success notification could go here
      }).catch(error => {
        console.error('Error updating jogging record:', error);
        this.error = 'Failed to update record';
      });
    } else {
      // Update swim record
      this.authService.updateSwimRecord(this.record as SwimRecord).then(() => {
        // Success notification could go here
      }).catch(error => {
        console.error('Error updating swim record:', error);
        this.error = 'Failed to update record';
      });
    }
  }

  onGoBack() {
    // Navigate back to the appropriate tab
    this.router.navigate(['/tracker'], { queryParams: { selectedTab: this.sourceTabIndex } });
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  // Helper methods for real-time previews
  previewSeconds(field: string): number {
    if (!this.timeInputs[field]) return 0;
    return this.parseTimeInput(this.timeInputs[field]);
  }

  isLevelUpPreview(): boolean {
    if (!this.record || !this.editModes['newLevel'] || this.tempValues['newLevel'] === undefined) {
      return this.isLevelUp();
    }
    return this.tempValues['newLevel'] > this.record.currentLevel;
  }

  isLevelDownPreview(): boolean {
    if (!this.record || !this.editModes['newLevel'] || this.tempValues['newLevel'] === undefined) {
      return this.isLevelDown();
    }
    return this.tempValues['newLevel'] < this.record.currentLevel;
  }
}
