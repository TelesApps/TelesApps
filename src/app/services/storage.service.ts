import { Inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
// isPlatformBrowser is used for SSR
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  // private themeClass: BehaviorSubject<string> = new BehaviorSubject<string>('');
  public themeClass = signal('');
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
  }

  changeTheme(theme?: 'dark-theme' | '') {
    if (isPlatformBrowser(this.platformId)) {
      let themeClass = this.themeClass();
      const body = document.body;
      if (!theme && themeClass && body) {
        this.themeClass.set('');
        body.classList.remove('dark-theme');
      } else if (body) {
        this.themeClass.set('dark-theme');
        body.classList.add('dark-theme');
      }
    }
  }
}
