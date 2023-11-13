import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
// isPlatformBrowser is used for SSR
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  private themeClass: BehaviorSubject<string> = new BehaviorSubject<string>('');
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    console.log('StorageService constructor');
  }

  getThemeClass() {
    return this.themeClass.asObservable();
  }

  changeTheme(theme?: 'dark-theme' | '') {
    if (isPlatformBrowser(this.platformId)) {
      let themeClass = this.themeClass.getValue();
      const body = document.body;
      if (!theme && themeClass && body) {
        this.themeClass.next('');
        body.classList.remove('dark-theme');
      } else if (body) {
        this.themeClass.next('dark-theme');
        body.classList.add('dark-theme');
      }
    }
  }
}
