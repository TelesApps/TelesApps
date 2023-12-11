import { ViewportScroller, isPlatformBrowser } from '@angular/common';
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AnimationService {

  private animationType: string = 'animation';

  constructor(private router: Router, private viewportScroller: ViewportScroller, @Inject(PLATFORM_ID) private platformId: Object) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        if (isPlatformBrowser(this.platformId)) {
        }
      }
    });
  }

  onNavigate(url: string, delay?: number) {
    this.viewportScroller.scrollToPosition([0, 0]);
    let scrollDuration = 400;
    if (delay)
      scrollDuration = delay;
    setTimeout(() => {
      this.router.navigate([url]);
    }, scrollDuration);
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
