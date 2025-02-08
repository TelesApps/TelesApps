import { Component } from '@angular/core';
import { StorageService } from '../services/storage.service';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
  baseUrl: string = 'https://ba.jw.org/api/volunteers/';
  userId: string = '';
  params: string = '?pagingOptions.skip=0&pagingOptions.sortColumn=32&pagingOptions.sortOrder=1&pagingOptions.take=100'
  apiUrl: string = '';

  constructor(public storage: StorageService) {
    this.storage.changeTheme();
  }

  onChange() {
    const { baseUrl, baPage, userId, baPageTab } = this.parseUrl();
    console.log('userId', userId);
    if(baPageTab !== 'events') {
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

}
