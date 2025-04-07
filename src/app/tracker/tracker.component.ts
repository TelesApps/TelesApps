import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { JoggingTrackerComponent } from './jogging-tracker/jogging-tracker.component';
import { StorageService } from '../services/storage.service';
import { MatIconModule } from '@angular/material/icon';
import { JoggingRecordsComponent } from './jogging-records/jogging-records.component';
import { RouterModule, Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter } from 'rxjs/operators';
import { SwimTrackerComponent } from './swim-tracker/swim-tracker.component';
import { SwimRecordsComponent } from './swim-records/swim-records.component';

@Component({
  selector: 'app-tracker',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    JoggingTrackerComponent,
    MatIconModule,
    JoggingRecordsComponent,
    RouterModule,
    SwimTrackerComponent,
    SwimRecordsComponent
  ],
  templateUrl: './tracker.component.html',
  styleUrls: ['./tracker.component.scss']
})
export class TrackerComponent implements OnInit {
  private route = inject(ActivatedRoute);
  selectedTabIndex = 0;
  isShowingDetails = false;

  constructor(
    private storage: StorageService,
    private router: Router
  ) {
    this.storage.changeTheme();
    
    // Subscribe to router events to detect when we're showing details
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.isShowingDetails = event.url.includes('/record') || event.url.includes('/swim-record');
    });
  }

  ngOnInit() {
    // Get selected tab from query params
    this.route.queryParams.subscribe(params => {
      if (params['selectedTab']) {
        this.selectedTabIndex = parseInt(params['selectedTab'], 10);
      }
      
      // Also check if we should be showing record details
      if (params['id']) {
        this.isShowingDetails = true;
      }
    });
  }

  // Swimming tracker logic will be added here
}
