import { isPlatformBrowser } from '@angular/common';
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AnimationService {

  private animationType: string = 'animation';

  constructor(private router: Router, @Inject(PLATFORM_ID) private platformId: Object) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        if (isPlatformBrowser(this.platformId)) {
          // Only execute this code in the browser
          window.scrollTo(0, 0);
        }
      }
    });
  }

  noAnimation() {
    this.animationType = '';
    setTimeout(() => {
      this.animationType = 'animation';
    }, 1000);
  }

  getAnimationType(): string {
    return this.animationType;
  }


}
