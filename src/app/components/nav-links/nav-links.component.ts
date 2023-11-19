import { Component, inject, Signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { StorageService } from '../../services/storage.service';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-nav-links',
  standalone: true,
  imports: [CommonModule, RouterModule, MatSlideToggleModule, ],
  templateUrl: './nav-links.component.html',
  styleUrl: './nav-links.component.scss'
})
export class NavLinksComponent {

  storage: StorageService = inject(StorageService)
  isDarkTheme: Signal<boolean> = computed(() => this.storage.themeClass() === 'dark-theme');


}
