import { Component, OnInit } from '@angular/core';
import { StorageService } from '../services/storage.service';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VolunteerEvents, Item } from '../interfaces/volunteerEvents';

@Component({
  selector: 'app-ba-formatter',
  imports: [CommonModule, FormsModule, MatInputModule, MatFormFieldModule],
  templateUrl: './ba-formatter.component.html',
  styleUrls: ['./ba-formatter.component.scss']
})
export class BaFormatterComponent implements OnInit {
  error: string = '';
  urlInput: string = '';
  codeInput: string = '';

  baseUrl: string = 'https://ba.jw.org/api/volunteers/';
  userId: string = '';
  params: string = '?pagingOptions.skip=0&pagingOptions.sortColumn=32&pagingOptions.sortOrder=1&pagingOptions.take=100';
  apiUrl: string = '';

  // Variables for the JSON data and results
  volunteerEvents: VolunteerEvents = {} as VolunteerEvents;
  total84DaysInvited: number = 0;
  total84DaysAccepted: number = 0;
  total12WeeksInvited: number = 0;
  total12WeeksAccepted: number = 0;
  // The following four values are computed for a 42-day period:
  totalDaysInvited: number = 0; 
  totalDaysAccepted: number = 0;
  totalWeeksInvited: number = 0; 
  totalWeeksAccepted: number = 0;
  //
  totalDaysWorked: number = 0;
  totalWeeksWorked: number = 0;
  isOverworked: boolean = false;
  isOverInvited: boolean = false;
  mostRecentEventDate: Date = new Date();
  maxWorkedInWindow: number = 0;
  maxInvitedDaysInWindow: number = 0;
  twelveWeeksAgo: Date = new Date();
  eightyFourFromRecent: Date = new Date();
  fourtyTwoFromRecent: Date = new Date();

  constructor(public storage: StorageService) {
    this.storage.changeTheme();
  }

  ngOnInit(): void {
    // For display purposes, 84 days ago is used to show the 12-week period.
    this.twelveWeeksAgo = new Date();
    this.twelveWeeksAgo.setDate(this.twelveWeeksAgo.getDate() - 84);
  }

  onChange(): void {
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
    const baseUrl = `${base}#`;
    const normalizedFragment = fragment.replace(/^\//, '');
    const parts = normalizedFragment.split('/');
    if (parts.length < 3) {
      throw new Error('Invalid URL: Not enough parts in the fragment.');
    }
    const [baPage, userId, baPageTab] = parts;
    return { baseUrl, baPage, userId, baPageTab };
  }

  onCodeChange(event: any): void {
    this.error = '';

    try {
      const json = JSON.parse(this.codeInput);
      if (json) {
        const volunteerEvents: VolunteerEvents = json;
        // Calculate the volunteer metrics using our refactored method.
        const result = this.calculateVolunteerDays(volunteerEvents, true);
        // Update component variables.
        this.volunteerEvents = volunteerEvents;
        this.total84DaysInvited = result.total84DaysInvited;
        this.total84DaysAccepted = result.total84DaysAccepted;
        this.total12WeeksInvited = result.total12WeeksInvited;
        this.total12WeeksAccepted = result.total12WeeksAccepted;
        this.totalDaysWorked = result.totalDaysWorked;
        this.totalWeeksWorked = result.totalWeeksWorked;
        // The following are the 42-day metrics:
        this.totalDaysInvited = result.totalDaysInvited;
        this.totalDaysAccepted = result.totalDaysAccepted;
        this.totalWeeksInvited = result.totalWeeksInvited;
        this.totalWeeksAccepted = result.totalWeeksAccepted;
        //
        this.isOverworked = result.isOverworked;
        this.isOverInvited = result.isOverInvited;
        this.maxWorkedInWindow = result.maxWorkedInWindow;
        this.maxInvitedDaysInWindow = result.maxInvitedDaysInWindow;
      }
    } catch (e) {
      this.error = 'Invalid JSON: Please check your input.';
    }
  }

  /**
   * Main calculation method that delegates specific tasks to helper functions.
   * It computes both the 84-day (and 12-week) metrics as well as the 42-day metrics.
   */
  private calculateVolunteerDays(volunteerEvents: VolunteerEvents, is84DaysOnly = false) {
    const today = new Date();
    let items: Item[] = volunteerEvents.items;

    // Filter events by cutoff.
    // (When is84DaysOnly is true, we use a cutoff of 84 days from the most recent event; otherwise 365 days.)
    if (is84DaysOnly) {
      items = this.filterEventsByCutoff(items, 84);
    } else {
      items = this.filterEventsByCutoff(items, 365);
    }

    // Sort events by startDateTime.
    items = items.sort(
      (a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime()
    );

    // Process events into day-level maps.
    const { invitedDaysMap, acceptedDaysMap, workedDaysMap } = this.processEventsToDayMaps(items, today);

    // ------------- 84-day (and 12-week) metrics -------------
    const total84DaysInvited = Array.from(invitedDaysMap.values()).reduce((sum, set) => sum + set.size, 0);
    const total84DaysAccepted = Array.from(acceptedDaysMap.values()).reduce((sum, set) => sum + set.size, 0);

    // For worked days, count only those in the last 42 days.
    const cutoff42 = new Date(today);
    cutoff42.setDate(today.getDate() - 42);
    const totalDaysWorked = Array.from(workedDaysMap.entries())
      .filter(([dayKey, _]) => new Date(dayKey) >= cutoff42)
      .reduce((sum, [_, set]) => sum + set.size, 0);

    // ------------- Sliding Window (84 days) for worked and invited days -------------
    const workedDates: Date[] = [];
    workedDaysMap.forEach((_, day) => workedDates.push(new Date(day)));
    workedDates.sort((a, b) => a.getTime() - b.getTime());
    const invitedDates: Date[] = [];
    invitedDaysMap.forEach((_, day) => invitedDates.push(new Date(day)));
    invitedDates.sort((a, b) => a.getTime() - b.getTime());
    const windowDuration = 84 * 24 * 60 * 60 * 1000; // 84 days
    const maxWorkedInWindow = this.calculateMaxInSlidingWindow(workedDates, windowDuration);
    const isOverworked = maxWorkedInWindow > 30;
    const maxInvitedDaysInWindow = this.calculateMaxInSlidingWindow(invitedDates, windowDuration);

    // ------------- 12-week metrics (from the full set of items) -------------
    const { total12WeeksInvited, total12WeeksAccepted } = this.calculateWeekCounts(items, today);

    // ------------- Weeks Worked (42-day window) -------------
    const filteredWorkedDates = workedDates.filter(date => date >= cutoff42);
    const weekMap: Map<string, Date[]> = new Map();
    filteredWorkedDates.forEach(date => {
      const weekKey = this.getISOWeekKey(date);
      if (!weekMap.has(weekKey)) {
        weekMap.set(weekKey, []);
      }
      weekMap.get(weekKey)?.push(date);
    });
    const totalWeeksWorked = weekMap.size;

    // ------------- 42-day metrics for Invitations and Accepted statuses -------------
    // For day counts (without grouping) within the last 42 days:
    const total42DaysInvited = Array.from(invitedDaysMap.entries())
      .filter(([dayKey, _]) => new Date(dayKey) >= cutoff42)
      .reduce((sum, [_, set]) => sum + set.size, 0);
    const total42DaysAccepted = Array.from(acceptedDaysMap.entries())
      .filter(([dayKey, _]) => new Date(dayKey) >= cutoff42)
      .reduce((sum, [_, set]) => sum + set.size, 0);

    // Group the 42-day invited days by ISO week, counting a week only if there are at least 4 days.
    const invitedDates42: Date[] = [];
    invitedDaysMap.forEach((_, day) => {
      const d = new Date(day);
      if (d >= cutoff42) {
        invitedDates42.push(d);
      }
    });
    invitedDates42.sort((a, b) => a.getTime() - b.getTime());
    const invitedWeekMap42: Map<string, Date[]> = new Map();
    invitedDates42.forEach(date => {
      const weekKey = this.getISOWeekKey(date);
      if (!invitedWeekMap42.has(weekKey)) {
        invitedWeekMap42.set(weekKey, []);
      }
      invitedWeekMap42.get(weekKey)?.push(date);
    });
    let total42WeeksInvited = 0;
    invitedWeekMap42.forEach((dates, weekKey) => {
      if (dates.length >= 4) {
        total42WeeksInvited++;
      }
    });

    // Group the 42-day accepted days by ISO week, counting a week only if there are at least 4 days.
    const acceptedDates42: Date[] = [];
    acceptedDaysMap.forEach((_, day) => {
      const d = new Date(day);
      if (d >= cutoff42) {
        acceptedDates42.push(d);
      }
    });
    acceptedDates42.sort((a, b) => a.getTime() - b.getTime());
    const acceptedWeekMap42: Map<string, Date[]> = new Map();
    acceptedDates42.forEach(date => {
      const weekKey = this.getISOWeekKey(date);
      if (!acceptedWeekMap42.has(weekKey)) {
        acceptedWeekMap42.set(weekKey, []);
      }
      acceptedWeekMap42.get(weekKey)?.push(date);
    });
    let total42WeeksAccepted = 0;
    acceptedWeekMap42.forEach((dates, weekKey) => {
      if (dates.length >= 4) {
        total42WeeksAccepted++;
      }
    });

    // ------------- Return all computed values -------------
    return {
      total84DaysInvited,
      total84DaysAccepted,
      totalDaysWorked,
      total12WeeksInvited,
      total12WeeksAccepted,
      totalWeeksWorked,
      // The following four are the 42-day metrics:
      totalDaysInvited: total42DaysInvited,
      totalDaysAccepted: total42DaysAccepted,
      totalWeeksInvited: total42WeeksInvited,
      totalWeeksAccepted: total42WeeksAccepted,
      isOverworked,
      isOverInvited: total84DaysInvited > 30, // Adjust this logic as needed.
      maxWorkedInWindow,
      maxInvitedDaysInWindow
    };
  }

  /**
   * Filters events so that only events within "days" (counted backwards from the most recent event)
   * are included.
   */
  private filterEventsByCutoff(items: Item[], days: number): Item[] {
    this.mostRecentEventDate = items.reduce((maxDate, item) => {
      const eventEnd = new Date(item.endDateTime);
      return eventEnd > maxDate ? eventEnd : maxDate;
    }, new Date(0));
    const cutoffDate = new Date(this.mostRecentEventDate);
    // Also update variables showing 84 and 42 days from the most recent event.
    this.eightyFourFromRecent = new Date(this.mostRecentEventDate);
    this.eightyFourFromRecent.setDate(this.mostRecentEventDate.getDate() - 84);
    this.fourtyTwoFromRecent = new Date(this.mostRecentEventDate);
    this.fourtyTwoFromRecent.setDate(this.mostRecentEventDate.getDate() - 42);
    // Calculate cutoff date: subtract the given number of days.
    cutoffDate.setDate(cutoffDate.getDate() - days);
    console.log('Cutoff Date:', cutoffDate);
    console.log('Most Recent Event Date:', this.mostRecentEventDate);
    console.log('Number of Events in Filtered List:', items.filter(item => new Date(item.endDateTime) >= cutoffDate).length);
    return items.filter(item => new Date(item.endDateTime) >= cutoffDate);
  }

  /**
   * Processes events into day-level maps for invitations, accepted events, and worked events.
   */
  private processEventsToDayMaps(items: Item[], today: Date): {
    invitedDaysMap: Map<string, Set<number>>,
    acceptedDaysMap: Map<string, Set<number>>,
    workedDaysMap: Map<string, Set<number>>
  } {
    const invitedDaysMap: Map<string, Set<number>> = new Map();
    const acceptedDaysMap: Map<string, Set<number>> = new Map();
    const workedDaysMap: Map<string, Set<number>> = new Map();

    items.forEach(item => {
      if (!item.statuses || item.statuses.length === 0) return;
      item.statuses.forEach(statusItem => {
        const workDay = new Date(statusItem.date);
        const dayKey = workDay.toISOString().split("T")[0];

        // Update invitedDaysMap.
        if (!invitedDaysMap.has(dayKey)) {
          invitedDaysMap.set(dayKey, new Set());
        }
        invitedDaysMap.get(dayKey)?.add(item.eventId);

        // If the status is accepted (status === 3), update acceptedDaysMap and, if applicable, workedDaysMap.
        if (statusItem.status === 3) {
          if (!acceptedDaysMap.has(dayKey)) {
            acceptedDaysMap.set(dayKey, new Set());
          }
          acceptedDaysMap.get(dayKey)?.add(item.eventId);

          if (workDay.getTime() <= today.getTime()) {
            if (!workedDaysMap.has(dayKey)) {
              workedDaysMap.set(dayKey, new Set());
            }
            workedDaysMap.get(dayKey)?.add(item.eventId);
          }
        }
      });
    });
    return { invitedDaysMap, acceptedDaysMap, workedDaysMap };
  }

  /**
   * Uses a sliding window to determine the maximum number of dates in any given window duration.
   */
  private calculateMaxInSlidingWindow(dates: Date[], windowDuration: number): number {
    let maxCount = 0;
    let start = 0;
    for (let end = 0; end < dates.length; end++) {
      while (dates[end].getTime() - dates[start].getTime() >= windowDuration) {
        start++;
      }
      maxCount = Math.max(maxCount, end - start + 1);
    }
    return maxCount;
  }

  /**
   * Calculates week counts from event-level data.
   * An event is considered a full week if it has more than 3 accepted statuses.
   * (This is used for the 12-week metrics.)
   */
  private calculateWeekCounts(items: Item[], today: Date): {
    total12WeeksInvited: number,
    total12WeeksAccepted: number
  } {
    let total12WeeksInvited = 0;
    let total12WeeksAccepted = 0;

    items.forEach(item => {
      const acceptedCount = item.statuses.filter(s => s.status === 3).length;
      if (acceptedCount > 3) {
        total12WeeksAccepted++;
      }
      if (item.statuses.length > 3) {
        total12WeeksInvited++;
      }
    });

    return { total12WeeksInvited, total12WeeksAccepted };
  }

  /**
   * Returns an ISO week key for a given date in the format "YYYY-Www".
   * This groups dates by ISO week (Monday is the first day of the week).
   */
  private getISOWeekKey(date: Date): string {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    // ISO week: Monday = 1, Sunday = 7. If getUTCDay() is 0 (Sunday), treat it as 7.
    const dayNum = d.getUTCDay() || 7;
    // Set to nearest Thursday: current date + 4 - current day number.
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const year = d.getUTCFullYear();
    const weekNum = Math.ceil((((d.getTime() - new Date(Date.UTC(year, 0, 1)).getTime()) / 86400000) + 1) / 7);
    return `${year}-W${weekNum}`;
  }

  /**
   * Converts an ISO week key (format "YYYY-Www") into a Date representing the start (Monday) of that ISO week.
   */
  private getStartOfISOWeekFromKey(weekKey: string): Date {
    // Split the key. For example, "2023-W05" → year = 2023, week = 5.
    const [yearStr, weekStr] = weekKey.split('-W');
    const year = parseInt(yearStr, 10);
    const week = parseInt(weekStr, 10);
    // January 4th is always in week 1 of an ISO calendar.
    const jan4 = new Date(year, 0, 4);
    // Find the Monday of the week that contains January 4th.
    const dayOfWeek = jan4.getDay();
    // If Sunday (0), treat it as 7.
    const normalizedDay = dayOfWeek === 0 ? 7 : dayOfWeek;
    const diff = 1 - normalizedDay; // Monday is 1
    const mondayOfWeek1 = new Date(jan4);
    mondayOfWeek1.setDate(jan4.getDate() + diff);
    // Now add (week - 1) weeks.
    mondayOfWeek1.setDate(mondayOfWeek1.getDate() + (week - 1) * 7);
    return mondayOfWeek1;
  }
}
