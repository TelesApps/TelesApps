import { Component, AfterViewInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink, RouterLinkActive, RouterModule, RouterOutlet } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { MatButtonModule } from '@angular/material/button';
import { StorageService } from './services/storage.service';
import { MatSidenavModule } from '@angular/material/sidenav';
import { NavLinksComponent } from './components/nav-links/nav-links.component';
import { slide } from '../assets/animations/animations';
import { AnimationBuilder } from '@angular/animations';
import { AnimationService } from './services/animation.service';

@Component({
    selector: 'app-root',
    providers: [StorageService],
    imports: [
        CommonModule,
        RouterOutlet,
        RouterLink,
        RouterLinkActive,
        MatSidenavModule,
        HeaderComponent,
        MatButtonModule,
        NavLinksComponent
    ],
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    animations: [slide]
})
export class AppComponent {
  title = 'telesApps';

  constructor(public storage: StorageService, public animation: AnimationService, private route: ActivatedRoute) {
    this.storage.changeTheme('dark-theme');
    console.log('app-version: versions to be established');
  }

  // Function below is specifically for the ba-assistant page, delete it if feature not in use.
  isRoute(route: string) {
    return this.route.snapshot.firstChild?.routeConfig?.path === route;
  }

  prepareRoute(outlet: RouterOutlet) {
    const animationType = this.animation.getAnimationType();
    return outlet && outlet.activatedRouteData && outlet.activatedRouteData[animationType];
  }




}
