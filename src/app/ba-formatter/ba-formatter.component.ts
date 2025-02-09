import { Component } from '@angular/core';
import { StorageService } from '../services/storage.service';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VolunteerEvents } from '../interfaces/volunteerEvents';

@Component({
  selector: 'app-ba-formatter',
  imports: [CommonModule, FormsModule, MatInputModule, MatFormFieldModule,],
  templateUrl: './ba-formatter.component.html',
  styleUrl: './ba-formatter.component.scss'
})
export class BaFormatterComponent {

  error: string = '';
  //Input is --> https://ba.jw.org/#/volunteers/165115/events
  //https://ba.jw.org/api/volunteers/165115/events?pagingOptions.skip=0&pagingOptions.sortColumn=32&pagingOptions.sortOrder=1&pagingOptions.take=100


  urlInput: string = '';
  codeInput: string = '';

  baseUrl: string = 'https://ba.jw.org/api/volunteers/';
  userId: string = '';
  params: string = '?pagingOptions.skip=0&pagingOptions.sortColumn=32&pagingOptions.sortOrder=1&pagingOptions.take=100'
  apiUrl: string = '';

  //Variables for the JSON
  volunteerEvents: VolunteerEvents = {} as VolunteerEvents;
  totalDaysInvited: number = 0;
  totalDaysAccepted: number = 0;
  totalWeeksInvited: number = 0;
  totalWeeksAccepted: number = 0;
  totalDaysWorked: number = 0;
  totalWeeksWorked: number = 0;
  isOverworked: boolean = false;
  isOverInvited: boolean = false;
  lastAvailableDate: Date = new Date();
  nextAvailableDate: Date = new Date();
  maxWorkedInWindow: number = 0;
  twelveWeeksAgo: Date = new Date();

  constructor(public storage: StorageService) {
    this.storage.changeTheme();
  }

  onChange() {
    const { baseUrl, baPage, userId, baPageTab } = this.parseUrl();
    console.log('userId', userId);
    if (baPageTab !== 'events') {
      this.error = 'Invalid URL: Please make sure to navigate to the events tab.';
      return;
    }
    this.userId = userId;
    this.apiUrl = `${this.baseUrl}${this.userId}/${baPageTab}${this.params}`;
  }

  parseUrl(): { baseUrl: string; baPage: string; userId: string; baPageTab: string } {
    // Split the URL into the part before the '#' and the fragment.
    const [base, fragment] = this.urlInput.split('#');
    if (!fragment) {
      throw new Error('Invalid URL: Missing hash (#) fragment.');
    }
    // The base URL is the part before the hash plus the '#' symbol.
    const baseUrl = `${base}#`;
    // Remove any leading slash from the fragment (if present) and split it.
    const normalizedFragment = fragment.replace(/^\//, '');
    const parts = normalizedFragment.split('/');
    if (parts.length < 3) {
      throw new Error('Invalid URL: Not enough parts in the fragment.');
    }
    // Destructure the parts array.
    const [baPage, userId, baPageTab] = parts;

    return { baseUrl, baPage, userId, baPageTab };
  }

  onCodeChange() {
    this.twelveWeeksAgo = new Date();
    this.twelveWeeksAgo.setDate(this.twelveWeeksAgo.getDate() - 84);
    
    this.error = '';
    let json: any;
    let volunteerEvents: VolunteerEvents = {} as VolunteerEvents;
    try {
      json = JSON.parse(this.codeInput);
      if (json) {
        volunteerEvents = json;
        const {
          totalDaysInvited,
          totalDaysAccepted,
          totalWeeksInvited,
          totalWeeksAccepted,
          totalDaysWorked,
          totalWeeksWorked,
          isOverworked,
          isOverInvited,
          lastAvailableDate,
          nextAvailableDate,
          maxWorkedInWindow
        } = this.calculateVolunteerDays(volunteerEvents, true);
        this.volunteerEvents = volunteerEvents;
        this.totalDaysInvited = totalDaysInvited;
        this.totalDaysAccepted = totalDaysAccepted;
        this.totalWeeksInvited = totalWeeksInvited;
        this.totalWeeksAccepted = totalWeeksAccepted;
        this.totalDaysWorked = totalDaysWorked;
        this.totalWeeksWorked = totalWeeksWorked;
        this.isOverworked = isOverworked;
        this.isOverInvited = isOverInvited;
        this.lastAvailableDate = lastAvailableDate;
        this.nextAvailableDate = nextAvailableDate;
        this.maxWorkedInWindow = maxWorkedInWindow;
      }
    } catch (e) {
      this.error = 'Invalid JSON: Please check your input.';
    }
  }

  calculateVolunteerDays(volunteerEvents: VolunteerEvents, is84DaysOnly = false) {

    const calculatedEvents: VolunteerEvents = volunteerEvents;

    // Get today's date. (If you want to compare only by date, consider truncating time.)
    const today = new Date();

    // Counters
    let totalDaysInvited = 0;
    let totalDaysAccepted = 0;
    let totalWeeksInvited = 0;
    let totalWeeksAccepted = 0;

    let totalDaysWorked = 0;
    let totalWeeksWorked = 0;

    // Flags for over‑limit work/invitations (we only check work relative to past events)
    let isOverworked = false;
    let isOverInvited = false;

    // Availability dates (based on worked events only)
    let lastAvailableDate: Date = new Date();
    let nextAvailableDate: Date = new Date();

    // We'll use three sets of unique day strings (formatted as "YYYY-MM-DD")
    const invitedDays = new Set<string>(); // all invitations regardless of date
    const acceptedDays = new Set<string>(); // all accepted events (status 3), regardless of date
    const workedDays = new Set<string>();   // accepted events that occurred on or before today

    if (is84DaysOnly) {
      // Define today's date and calculate the date 84 days ago.
      const today = new Date();
      const eightyFourDaysAgo = new Date();
      eightyFourDaysAgo.setDate(today.getDate() - 84);

      // Filter events to include those with an endDateTime on or after 84 days ago.
      calculatedEvents.items = volunteerEvents.items.filter(item => {
        const eventEndDate = new Date(item.endDateTime);
        return eventEndDate >= eightyFourDaysAgo;
      });

      // Update the total count if needed.
      calculatedEvents.totalItemCount = calculatedEvents.items.length;
    }

    // Sort events by their startDateTime (ascending)
    const events = calculatedEvents.items.sort(
      (a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime()
    );

    // Process each event
    events.forEach(item => {
      if (!item.statuses || item.statuses.length === 0) {
        return;
      }

      // Process each work-day represented in the event’s statuses array.
      item.statuses.forEach(statusItem => {
        // Use the work-day's date from the status object rather than the event’s startDateTime.
        const workDay = new Date(statusItem.date);
        const dayKey = workDay.toISOString().split("T")[0]; // e.g., "2025-02-09"

        // Every status entry represents an invitation for that work day.
        invitedDays.add(dayKey);

        // If the volunteer accepted for this work day (status === 3),
        // add the day to acceptedDays. Also, if this work day is not in the future,
        // add it to workedDays.
        if (statusItem.status === 3) {
          acceptedDays.add(dayKey);
          if (workDay.getTime() <= today.getTime()) {
            workedDays.add(dayKey);
          }
        }
      });
    });


    // Basic day counts
    totalDaysInvited = invitedDays.size;
    totalDaysAccepted = acceptedDays.size;
    totalDaysWorked = workedDays.size;

    // Group days into weeks. Our week runs from Tuesday to Saturday.
    // The helper function returns a week key (the Tuesday of that week) for any given date.
    function getWeekKey(date: Date): string {
      // getDay(): Sunday = 0, Monday = 1, Tuesday = 2, …, Saturday = 6.
      const dayOfWeek = date.getDay();
      let diff = 0;
      if (dayOfWeek >= 2) {
        diff = dayOfWeek - 2;
      } else {
        // For Sunday (0) or Monday (1), “borrow” from the previous week.
        diff = dayOfWeek + 5;
      }
      const tuesday = new Date(date);
      tuesday.setDate(date.getDate() - diff);
      return tuesday.toISOString().split("T")[0];
    }

    // Group accepted days into weeks
    const acceptedWeeks = new Map<string, number>();
    acceptedDays.forEach(day => {
      const date = new Date(day);
      const weekKey = getWeekKey(date);
      acceptedWeeks.set(weekKey, (acceptedWeeks.get(weekKey) || 0) + 1);
    });
    acceptedWeeks.forEach(count => {
      // Count a week as "complete" if events are accepted on all 5 days (Tuesday to Saturday)
      if (count === 5) {
        totalWeeksAccepted++;
      }
    });

    // Group invited days into weeks (overall invitations are not filtered by today)
    const invitedWeeks = new Map<string, number>();
    invitedDays.forEach(day => {
      const date = new Date(day);
      const weekKey = getWeekKey(date);
      invitedWeeks.set(weekKey, (invitedWeeks.get(weekKey) || 0) + 1);
    });
    invitedWeeks.forEach(count => {
      if (count === 5) {
        totalWeeksInvited++;
      }
    });

    // Group worked (past accepted) days into weeks
    const workedWeeks = new Map<string, number>();
    workedDays.forEach(day => {
      const date = new Date(day);
      const weekKey = getWeekKey(date);
      workedWeeks.set(weekKey, (workedWeeks.get(weekKey) || 0) + 1);
    });
    workedWeeks.forEach(count => {
      if (count === 5) {
        totalWeeksWorked++;
      }
    });

    // Check the 84-day (12‑week) sliding window using only worked (i.e. past accepted) days.
    // A volunteer cannot work more than 30 days within any 84‑day span.
    const workedDateArray = Array.from(workedDays)
      .map(d => new Date(d))
      .sort((a, b) => a.getTime() - b.getTime());

    const windowDuration = 84 * 24 * 60 * 60 * 1000; // 84 days in milliseconds
    let maxWorkedInWindow = 0;
    let start = 0;
    for (let end = 0; end < workedDateArray.length; end++) {
      while (
        workedDateArray[end].getTime() - workedDateArray[start].getTime() >= windowDuration
      ) {
        start++;
      }
      const daysInWindow = end - start + 1;
      if (daysInWindow > maxWorkedInWindow) {
        maxWorkedInWindow = daysInWindow;
      }
    }

    if (maxWorkedInWindow > 30) {
      isOverworked = true;
    }

    // (Optional) If you wish to check invitations relative to today, you could similarly filter
    // invitedDays and set isOverInvited accordingly. In this example, we leave isOverInvited as false.

    // Determine availability dates based on worked events:
    // lastAvailableDate: the most recent worked day.
    // nextAvailableDate: an example calculation based on when the volunteer will drop below the 30-day limit.
    if (workedDateArray.length > 0) {
      lastAvailableDate = workedDateArray[workedDateArray.length - 1];
    }
    if (workedDateArray.length >= 30) {
      // For example, take the 30th most recent worked day and add one day.
      // (This is a simple heuristic—you may need a more precise calculation.)
      nextAvailableDate = new Date(workedDateArray[workedDateArray.length - 30]);
      nextAvailableDate.setDate(nextAvailableDate.getDate() + 1);
    } else {
      nextAvailableDate = new Date();
    }

    // Return all computed values.
    return {
      totalDaysInvited,
      totalDaysAccepted,
      totalWeeksInvited,
      totalWeeksAccepted,
      totalDaysWorked,
      totalWeeksWorked,
      isOverworked,
      isOverInvited,
      lastAvailableDate,
      nextAvailableDate,
      maxWorkedInWindow // for debugging/inspection if needed
    };
  }


}
