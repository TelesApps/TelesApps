import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { JoggingTracker } from '../../interfaces/tracker.interface';
import { FireTimeRecordPipe } from '../../shared/pipes/fire-time-record.pipe';
import { AuthService } from '../../services/auth.service';
import { take, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-jogging-records',
  standalone: true,
  imports: [CommonModule, MatExpansionModule, MatIconModule, MatTooltipModule, FireTimeRecordPipe, RouterModule],
  templateUrl: './jogging-records.component.html',
  styleUrls: ['./jogging-records.component.scss']
})
export class JoggingRecordsComponent implements OnInit, OnDestroy {
  joggingRecords: JoggingTracker[] = [];
  isLoading = true;

  // Store the pre-computed records by year and month
  recordsByYearAndMonth: { [year: string]: { [month: string]: JoggingTracker[] } } = {};

  // Current year and month for auto-expansion
  currentYear: string;
  currentMonth: string;

  // Month names in chronological order for sorting
  private monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // For unsubscribing from observables
  private destroy$ = new Subject<void>();

  // JavaScript Math object for use in the template
  Math = Math;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    // Initialize current year and month
    const now = new Date();
    this.currentYear = now.getFullYear().toString();
    this.currentMonth = this.monthNames[now.getMonth()];
  }

  ngOnInit() {
    // Load user's run records from Firebase
    this.loadUserRunRecords();
  }

  ngOnDestroy() {
    // Clean up subscriptions when the component is destroyed
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Load user's run records from Firebase
  loadUserRunRecords() {
    this.isLoading = true;
    
    // Get the current user
    this.authService.user$.pipe(
      take(1),
      takeUntil(this.destroy$)
    ).subscribe(user => {
      if (user) {
        // Get the user ID from the user object
        const userId = user.userId;
        
        if (userId) {
          // Subscribe to the user's run records
          this.authService.getUserRunRecords(userId)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (records) => {
                this.joggingRecords = records;
                console.log('Loaded jogging records:', this.joggingRecords);
                // Pre-compute records by year and month
                this.organizeRecordsByYearAndMonth();
                this.isLoading = false;
              },
              error: (error) => {
                console.error('Error loading run records:', error);
                this.joggingRecords = [];
                this.organizeRecordsByYearAndMonth();
                this.isLoading = false;
              }
            });
        } else {
          console.warn('User object does not contain a valid ID');
          this.joggingRecords = [];
          this.organizeRecordsByYearAndMonth();
          this.isLoading = false;
        }
      } else {
        console.warn('No user logged in, cannot load run records');
        this.joggingRecords = [];
        this.organizeRecordsByYearAndMonth();
        this.isLoading = false;
      }
    });
  }

  // Organize records by year and month for display
  organizeRecordsByYearAndMonth() {
    this.recordsByYearAndMonth = {};
    
    // Process each record
    for (const record of this.joggingRecords) {
      // Parse the date
      const date = new Date(record.date);
      const year = date.getFullYear().toString();
      const month = this.monthNames[date.getMonth()];
      
      // Initialize year object if it doesn't exist
      if (!this.recordsByYearAndMonth[year]) {
        this.recordsByYearAndMonth[year] = {};
      }
      
      // Initialize month array if it doesn't exist
      if (!this.recordsByYearAndMonth[year][month]) {
        this.recordsByYearAndMonth[year][month] = [];
      }
      
      // Add record to the appropriate month array
      this.recordsByYearAndMonth[year][month].push(record);
    }
    
    // Sort records within each month by date (newest first)
    for (const year in this.recordsByYearAndMonth) {
      for (const month in this.recordsByYearAndMonth[year]) {
        this.recordsByYearAndMonth[year][month].sort((a, b) => {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        });
      }
    }
  }

  // Get total records for a year
  getTotalRecordsForYear(yearData: { [month: string]: JoggingTracker[] }): number {
    let total = 0;
    for (const month in yearData) {
      total += yearData[month].length;
    }
    return total;
  }

  // Check if a year is the current year
  isCurrentYear(year: string): boolean {
    return year === this.currentYear;
  }

  // Check if a month is the current month in the current year
  isCurrentMonth(year: string, month: string): boolean {
    return this.isCurrentYear(year) && month === this.currentMonth;
  }

  // Comparator function for sorting years (newest first)
  newestFirst = (a: any, b: any) => {
    return b.key.localeCompare(a.key);
  }

  // Comparator function for sorting months chronologically
  monthComparator = (a: any, b: any) => {
    return this.monthNames.indexOf(a.key) - this.monthNames.indexOf(b.key);
  }

  // Event handler for year panel opened
  onYearPanelOpened(year: string) {
    console.log(`Year panel opened: ${year}`);
  }

  // Event handler for month panel opened
  onMonthPanelOpened(year: string, month: string) {
    console.log(`Month panel opened: ${year} - ${month}`);
  }

}
