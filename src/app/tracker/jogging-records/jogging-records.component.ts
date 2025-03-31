import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JoggingTracker } from '../../interfaces/tracker.interface';
import { MatExpansionModule } from '@angular/material/expansion';
import { KeyValue } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FireTimeRecordPipe } from '../../shared/pipes/fire-time-record.pipe';

@Component({
  selector: 'app-jogging-records',
  standalone: true,
  imports: [CommonModule, MatExpansionModule, MatIconModule, MatTooltipModule, FireTimeRecordPipe],
  templateUrl: './jogging-records.component.html',
  styleUrls: ['./jogging-records.component.scss']
})
export class JoggingRecordsComponent implements OnInit {
  joggingRecords: JoggingTracker[] = [];

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

  constructor() {
    // Get current date for auto-expansion
    const now = new Date();
    this.currentYear = now.getFullYear().toString();
    this.currentMonth = now.toLocaleString('default', { month: 'long' });
  }

  ngOnInit(): void {
    // Compute the records once when the component initializes
    this.recordsByYearAndMonth = this.computeRecordsByYearAndMonth();
  }

  // Check if a panel should be auto-expanded
  isCurrentYear(year: string): boolean {
    return year === this.currentYear;
  }

  isCurrentMonth(month: string): boolean {
    return month === this.currentMonth;
  }

  // Custom sorting function for KeyValue pipe to ensure newest items are first
  newestFirst = (a: KeyValue<string, any>, b: KeyValue<string, any>): number => {
    // For years, sort numerically in descending order
    if (this.isNumeric(a.key) && this.isNumeric(b.key)) {
      return Number(b.key) - Number(a.key);
    }
    
    // For months, sort by month index in descending order
    const aMonthIndex = this.monthNames.indexOf(a.key);
    const bMonthIndex = this.monthNames.indexOf(b.key);
    
    if (aMonthIndex !== -1 && bMonthIndex !== -1) {
      return bMonthIndex - aMonthIndex;
    }
    
    // Default to alphabetical order if not year or month
    return a.key.localeCompare(b.key);
  }

  // Helper to check if a string is numeric
  isNumeric(value: string): boolean {
    return !isNaN(Number(value));
  }

  // Make Math available to the template
  Math = Math;

  // Helper method to group records by year and month - only called once on init
  computeRecordsByYearAndMonth(): { [year: string]: { [month: string]: JoggingTracker[] } } {
    const groupedRecords: { [year: string]: { [month: string]: JoggingTracker[] } } = {};
    
    // Group records by year and month
    this.joggingRecords.forEach(record => {
      const date = new Date(record.date);
      const year = date.getFullYear().toString();
      const month = date.toLocaleString('default', { month: 'long' });
      
      if (!groupedRecords[year]) {
        groupedRecords[year] = {};
      }
      
      if (!groupedRecords[year][month]) {
        groupedRecords[year][month] = [];
      }
      
      groupedRecords[year][month].push(record);
    });
    
    // Sort records within each month by date (most recent first)
    for (const year in groupedRecords) {
      for (const month in groupedRecords[year]) {
        groupedRecords[year][month].sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
      }
    }
    
    return groupedRecords;
  }
}
