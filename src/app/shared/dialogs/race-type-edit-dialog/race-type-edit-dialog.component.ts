import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { RaceType } from '../../../interfaces/user-data.interface';
import { FireTimeRecordPipe } from '../../../shared/pipes/fire-time-record.pipe';

@Component({
  selector: 'app-race-type-edit-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    FireTimeRecordPipe
  ],
  template: `
    <h2 mat-dialog-title>Edit {{ data.raceType.name }}</h2>
    <div mat-dialog-content>
      <div style="display: flex; flex-direction: column; gap: 16px; padding: 16px 0;">
        <div>
          <span style="color: var(--accent-darker); font-size: 16px;">{{ previewSeconds() | fireTimeRecord }}</span>
          <mat-form-field appearance="fill" color="accent" style="width: 100%;">
            <mat-label>First Place Time (MM.SS)</mat-label>
            <input matInput [(ngModel)]="timeInput" placeholder="00.00" (input)="onTimeInput()">
          </mat-form-field>
        </div>

        <mat-form-field appearance="fill" color="accent">
          <mat-label>Level (1-5)</mat-label>
          <input matInput type="number" min="1" max="5" [(ngModel)]="data.raceType.level">
        </mat-form-field>
      </div>
    </div>
    <div mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-raised-button color="primary" (click)="onSave()">Save</button>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      min-width: 300px;
    }
  `]
})
export class RaceTypeEditDialogComponent {
  timeInput: string = '';
  private totalSeconds: number = 0;

  constructor(
    public dialogRef: MatDialogRef<RaceTypeEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { raceType: RaceType }
  ) {
    // Convert seconds to MM.SS format for the input
    const minutes = Math.floor(this.data.raceType.time / 60);
    const seconds = Math.round(this.data.raceType.time % 60);
    this.timeInput = `${minutes}.${seconds.toString().padStart(2, '0')}`;
    this.totalSeconds = this.data.raceType.time;
  }

  onTimeInput(): void {
    if (this.timeInput == null || this.timeInput === '') {
      this.totalSeconds = 0;
      return;
    }

    const [minutesStr, secondsStr] = this.timeInput.split('.');
    const minutes = parseInt(minutesStr, 10) || 0;
    const seconds = parseInt(secondsStr?.padEnd(2, '0').substring(0, 2), 10) || 0;
    this.totalSeconds = minutes * 60 + seconds;
  }

  previewSeconds(): number {
    return this.totalSeconds;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    this.dialogRef.close({
      ...this.data.raceType,
      time: this.totalSeconds
    });
  }
} 