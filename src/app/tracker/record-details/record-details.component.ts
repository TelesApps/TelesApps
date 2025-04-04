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
import { JoggingTracker } from '../../interfaces/tracker.interface';
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
  
  record: JoggingTracker | null = null;
  isLoading = true;
  error: string | null = null;

  // Edit mode tracking
  editModes: { [key: string]: boolean } = {
    date: false,
    distance: false,
    time: false,
    pace: false,
    firstPlaceTime: false,
    placement: false,
    currentLevel: false,
    newLevel: false
  };
  
  // Temporary values for editing
  tempValues: { [key: string]: any } = {};
  
  // Time input values for different fields
  timeInputs: { [key: string]: string } = {
    time: '',
    pace: '',
    firstPlaceTime: ''
  };

  constructor() {
    this.userSubscription = this.authService.user$.subscribe(user => {
      if (user) {
        this.user.set(user);
      }
    });
  }

  ngOnInit() {
    const recordId = this.route.snapshot.paramMap.get('id');
    if (recordId) {
      this.loadRecord(recordId);
    }
  }

  private loadRecord(recordId: string) {
    this.authService.user$.pipe(take(1)).subscribe(user => {
      if (user) {
        this.authService.getUserRunRecords(user.userId).pipe(take(1)).subscribe(records => {
          const record = records.find(r => r.id === recordId);
          if (record) {
            this.record = record;
            this.resetTempValues();
          } else {
            this.error = 'Record not found';
          }
          this.isLoading = false;
        });
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
    
    this.tempValues = {
      date: new Date(this.record.date),
      distanceMiles: this.record.distanceMiles,
      distanceKilometers: this.record.distanceKilometers,
      time: this.record.time,
      pace: this.record.pace,
      firstPlaceTime: this.record.firstPlaceTime,
      placement: this.record.placement,
      currentLevel: this.record.currentLevel,
      newLevel: this.record.newLevel
    };
    
    // Format time values for display
    if (this.record.time) {
      const minutes = Math.floor(this.record.time / 60);
      const seconds = Math.round(this.record.time % 60);
      this.timeInputs['time'] = `${minutes}.${seconds.toString().padStart(2, '0')}`;
    }
    
    if (this.record.pace) {
      const minutes = Math.floor(this.record.pace / 60);
      const seconds = Math.round(this.record.pace % 60);
      this.timeInputs['pace'] = `${minutes}.${seconds.toString().padStart(2, '0')}`;
    }
    
    if (this.record.firstPlaceTime) {
      const minutes = Math.floor(this.record.firstPlaceTime / 60);
      const seconds = Math.round(this.record.firstPlaceTime % 60);
      this.timeInputs['firstPlaceTime'] = `${minutes}.${seconds.toString().padStart(2, '0')}`;
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
    
    switch (field) {
      case 'date':
        if (this.tempValues['date']) {
          this.record.date = new Date(this.tempValues['date']).toISOString();
        }
        break;
        
      case 'distance':
        if (this.tempValues['distanceMiles']) {
          this.record.distanceMiles = parseFloat(this.tempValues['distanceMiles']);
          // Auto-calculate kilometers
          this.record.distanceKilometers = this.record.distanceMiles * 1.60934;
        }
        break;
        
      case 'time':
        if (this.timeInputs['time']) {
          const totalSeconds = this.parseTimeInput(this.timeInputs['time']);
          if (totalSeconds > 0) {
            this.record.time = totalSeconds;
            // Auto-update pace if distance is available
            if (this.record.distanceMiles > 0) {
              this.record.pace = totalSeconds / this.record.distanceMiles;
              // Update pace input value
              const minutes = Math.floor(this.record.pace / 60);
              const seconds = Math.round(this.record.pace % 60);
              this.timeInputs['pace'] = `${minutes}.${seconds.toString().padStart(2, '0')}`;
            }
          }
        }
        break;
        
      case 'pace':
        if (this.timeInputs['pace']) {
          const paceSeconds = this.parseTimeInput(this.timeInputs['pace']);
          if (paceSeconds > 0) {
            this.record.pace = paceSeconds;
            // Auto-update time if distance is available
            if (this.record.distanceMiles > 0) {
              this.record.time = paceSeconds * this.record.distanceMiles;
              // Update time input value
              const minutes = Math.floor(this.record.time / 60);
              const seconds = Math.round(this.record.time % 60);
              this.timeInputs['time'] = `${minutes}.${seconds.toString().padStart(2, '0')}`;
            }
          }
        }
        break;
        
      case 'firstPlaceTime':
        if (this.timeInputs['firstPlaceTime']) {
          const firstPlaceSeconds = this.parseTimeInput(this.timeInputs['firstPlaceTime']);
          if (firstPlaceSeconds > 0) {
            this.record.firstPlaceTime = firstPlaceSeconds;
          }
        }
        break;
        
      case 'placement':
        if (this.tempValues['placement']) {
          this.record.placement = parseInt(this.tempValues['placement'], 10);
        }
        break;
        
      case 'currentLevel':
        if (this.tempValues['currentLevel']) {
          this.record.currentLevel = parseInt(this.tempValues['currentLevel'], 10);
        }
        break;
        
      case 'newLevel':
        if (this.tempValues['newLevel']) {
          this.record.newLevel = parseInt(this.tempValues['newLevel'], 10);
        }
        break;
    }
    
    // Save to database
    this.saveRecord();
    
    // Exit edit mode
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
    
    this.authService.updateRunRecord(this.record.userId, this.record).then(() => {
      // Success notification could go here
    }).catch(error => {
      console.error('Error updating run record:', error);
      this.error = 'Failed to update record';
    });
  }

  onGoBack() {
    this.router.navigate(['/tracker']);
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }
}
