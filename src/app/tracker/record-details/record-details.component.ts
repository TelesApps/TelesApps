import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { JoggingTracker } from '../../interfaces/tracker.interface';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-record-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './record-details.component.html',
  styleUrls: ['./record-details.component.scss']
})
export class RecordDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  
  record: JoggingTracker | null = null;
  isLoading = true;
  error: string | null = null;

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
          } else {
            this.error = 'Record not found';
          }
          this.isLoading = false;
        });
      }
    });
  }
}
