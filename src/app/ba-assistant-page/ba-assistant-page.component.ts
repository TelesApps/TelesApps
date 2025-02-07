import { Component } from '@angular/core';
import { StorageService } from '../services/storage.service';
import { MatButtonModule } from '@angular/material/button';
import { HttpClient } from '@angular/common/http';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-ba-assistant-page',
  imports: [MatButtonModule, MatProgressSpinnerModule],
  templateUrl: './ba-assistant-page.component.html',
  styleUrl: './ba-assistant-page.component.scss'
})
export class BaAssistantPageComponent {

  isLoading = false;

  constructor(public storage: StorageService, private http: HttpClient) {
    this.storage.changeTheme();
  }

  testConnection() {
    this.isLoading = true;
    const testUrl = 'https://ba.jw.org/api/announcements?pagingOptions.skip=0&pagingOptions.sortColumn=1&pagingOptions.sortOrder=1&pagingOptions.take=5'
    // call https://ba.jw.org/#/overview to check if the connection is working
    // set headers to accept application/json and application/xml and cors
    const headers = {
      'Accept': 'application/json, application/xml',
      'Access-Control-Allow-Origin': '*'
    }
    this.http
    this.http.get(testUrl, { headers }).subscribe(
      {
        next: (response) => {
          console.log('Response:', response);
          this.isLoading = false;
        },
        error: (error) => {
          console.log('Error:', error);
          this.isLoading = false;
        }
      }
    );
  }

}
