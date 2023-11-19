import { Component, AfterViewInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { MatButtonModule } from '@angular/material/button';
import { StorageService } from './services/storage.service';
import {MatSidenavModule} from '@angular/material/sidenav';
import { NavLinksComponent } from './components/nav-links/nav-links.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, MatSidenavModule, HeaderComponent, MatButtonModule, NavLinksComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent  {
  title = 'telesApps';

  constructor(public storage: StorageService) {
    this.storage.changeTheme('dark-theme');
  }


  test() {
    console.log('test');
  }


}
