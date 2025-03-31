import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JoggingTracker } from '../../interfaces/tracker.interface';
import { MatExpansionModule } from '@angular/material/expansion';
import { KeyValue } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-jogging-records',
  standalone: true,
  imports: [CommonModule, MatExpansionModule, MatIconModule, MatTooltipModule],
  templateUrl: './jogging-records.component.html',
  styleUrls: ['./jogging-records.component.scss']
})
export class JoggingRecordsComponent implements OnInit {
  joggingRecords: JoggingTracker[] = [
    // 2025 Records
    {
      id: '1',
      userId: 'user123',
      date: '2025-03-28T14:30:45.123Z',
      raceType: 'miles_3-5',
      course: 'Central Park Loop',
      routes: [
        {
          slug: 'central-park-main',
          name: 'Central Park Main Path',
          miles: 4.2,
          kilometers: 6.76
        }
      ],
      distanceMiles: 4.2,
      distanceKilometers: 6.76,
      time: 1800, // 30 minutes in seconds
      pace: 428.57, // seconds per mile
      firstPlaceTime: 1500, // 25 minutes in seconds
      placement: 3,
      currentLevel: 3
    },
    {
      id: '2',
      userId: 'user123',
      date: '2025-03-25T09:15:22.456Z',
      raceType: 'mile_sprint',
      course: 'Riverside Track',
      routes: [
        {
          slug: 'riverside-sprint',
          name: 'Riverside Sprint Track',
          miles: 1.0,
          kilometers: 1.61
        }
      ],
      distanceMiles: 1.0,
      distanceKilometers: 1.61,
      time: 390, // 6:30 minutes in seconds
      pace: 390, // seconds per mile
      firstPlaceTime: 330, // 5:30 minutes in seconds
      placement: 2,
      currentLevel: 4
    },
    {
      id: '3',
      userId: 'user123',
      date: '2025-03-20T17:45:10.789Z',
      raceType: 'miles_5-7',
      course: 'Lakeside Trail',
      routes: [
        {
          slug: 'lakeside-long',
          name: 'Lakeside Long Route',
          miles: 6.5,
          kilometers: 10.46
        }
      ],
      distanceMiles: 6.5,
      distanceKilometers: 10.46,
      time: 3300, // 55 minutes in seconds
      pace: 507.69, // seconds per mile
      firstPlaceTime: 2940, // 49 minutes in seconds
      placement: 4,
      currentLevel: 2
    },
    {
      id: '4',
      userId: 'user123',
      date: '2025-01-15T08:20:33.567Z',
      raceType: 'miles_3-5',
      course: 'Winter Park Trail',
      routes: [
        {
          slug: 'winter-trail',
          name: 'Winter Park Main Trail',
          miles: 3.8,
          kilometers: 6.12
        }
      ],
      distanceMiles: 3.8,
      distanceKilometers: 6.12,
      time: 1920, // 32 minutes in seconds
      pace: 505.26, // seconds per mile
      firstPlaceTime: 1680, // 28 minutes in seconds
      placement: 4,
      currentLevel: 2
    },
    // 2024 Records
    {
      id: '5',
      userId: 'user123',
      date: '2024-12-24T16:30:00.123Z',
      raceType: 'miles_1-3',
      course: 'Holiday Run',
      routes: [
        {
          slug: 'holiday-course',
          name: 'Christmas Eve Course',
          miles: 2.5,
          kilometers: 4.02
        }
      ],
      distanceMiles: 2.5,
      distanceKilometers: 4.02,
      time: 1200, // 20 minutes in seconds
      pace: 480, // seconds per mile
      firstPlaceTime: 1080, // 18 minutes in seconds
      placement: 3,
      currentLevel: 3
    },
    {
      id: '6',
      userId: 'user123',
      date: '2024-10-31T19:15:45.678Z',
      raceType: 'miles_3-5',
      course: 'Halloween Run',
      routes: [
        {
          slug: 'halloween-course',
          name: 'Spooky Night Trail',
          miles: 4.0,
          kilometers: 6.44
        }
      ],
      distanceMiles: 4.0,
      distanceKilometers: 6.44,
      time: 1920, // 32 minutes in seconds
      pace: 480, // seconds per mile
      firstPlaceTime: 1740, // 29 minutes in seconds
      placement: 3,
      currentLevel: 3
    },
    {
      id: '7',
      userId: 'user123',
      date: '2024-07-04T07:45:22.345Z',
      raceType: 'miles_1-3',
      course: 'Independence Day Run',
      routes: [
        {
          slug: 'july-fourth',
          name: 'Freedom Trail',
          miles: 3.0,
          kilometers: 4.83
        }
      ],
      distanceMiles: 3.0,
      distanceKilometers: 4.83,
      time: 1380, // 23 minutes in seconds
      pace: 460, // seconds per mile
      firstPlaceTime: 1260, // 21 minutes in seconds
      placement: 2,
      currentLevel: 4
    },
    // 2023 Records
    {
      id: '8',
      userId: 'user123',
      date: '2023-12-31T23:45:59.999Z',
      raceType: 'miles_1-3',
      course: 'New Year\'s Eve Run',
      routes: [
        {
          slug: 'nye-course',
          name: 'Year End Sprint',
          miles: 2.0,
          kilometers: 3.22
        }
      ],
      distanceMiles: 2.0,
      distanceKilometers: 3.22,
      time: 960, // 16 minutes in seconds
      pace: 480, // seconds per mile
      firstPlaceTime: 900, // 15 minutes in seconds
      placement: 1,
      currentLevel: 5
    },
    {
      id: '9',
      userId: 'user123',
      date: '2023-09-15T15:30:45.234Z',
      raceType: 'miles_5-7',
      course: 'Fall Marathon Prep',
      routes: [
        {
          slug: 'marathon-prep',
          name: 'Long Distance Trail',
          miles: 6.2,
          kilometers: 9.98
        }
      ],
      distanceMiles: 6.2,
      distanceKilometers: 9.98,
      time: 3360, // 56 minutes in seconds
      pace: 541.94, // seconds per mile
      firstPlaceTime: 3120, // 52 minutes in seconds
      placement: 4,
      currentLevel: 2
    },
    {
      id: '10',
      userId: 'user123',
      date: '2023-05-01T06:30:15.567Z',
      raceType: 'mile_sprint',
      course: 'Spring Sprint',
      routes: [
        {
          slug: 'spring-mile',
          name: 'May Day Mile',
          miles: 1.0,
          kilometers: 1.61
        }
      ],
      distanceMiles: 1.0,
      distanceKilometers: 1.61,
      time: 420, // 7 minutes in seconds
      pace: 420, // seconds per mile
      firstPlaceTime: 360, // 6 minutes in seconds
      placement: 2,
      currentLevel: 4
    }
  ];

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

  // Format pace from seconds to minutes:seconds per mile
  formatPace(paceInSeconds: number): string {
    if (!paceInSeconds) return '0:00';
    
    const minutes = Math.floor(paceInSeconds / 60);
    const seconds = Math.floor(paceInSeconds % 60);
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}/mi`;
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
  private isNumeric(value: string): boolean {
    return /^\d+$/.test(value);
  }

  // Helper method to group records by year and month - only called once on init
  private computeRecordsByYearAndMonth(): { [year: string]: { [month: string]: JoggingTracker[] } } {
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
