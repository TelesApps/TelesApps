import { Component, inject } from '@angular/core';
import { CommonModule, NgOptimizedImage, ViewportScroller } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AnimationService } from '../services/animation.service';


@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage, MatProgressSpinnerModule, MatButtonModule, RouterModule],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss'
})
export class HomePageComponent {

  animation = inject(AnimationService);

}
