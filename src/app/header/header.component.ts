import { Component, Output, EventEmitter, Signal, inject, computed } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { NavLinksComponent } from '../components/nav-links/nav-links.component';
import { StorageService } from '../services/storage.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';


@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, MatToolbarModule, MatIconModule, RouterModule, NavLinksComponent, NgOptimizedImage, MatProgressSpinnerModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {

  logoSrc: Signal<string> = computed(() => {
    return this.storage.themeClass() ? 'assets/images/logo-white-220px.png' : 'assets/images/logo-black-220px.png';
  });
  @Output() openNavBar = new EventEmitter();
  storage: StorageService = inject(StorageService);

  constructor() {
    
  }

  onOpenNavbar() {
    console.log('open');
    // this.valueChanged.emit('open');
  }

}
