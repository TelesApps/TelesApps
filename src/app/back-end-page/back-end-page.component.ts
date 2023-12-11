import { Component, inject } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { AnimationService } from '../services/animation.service';

@Component({
  selector: 'app-back-end-page',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage, MatButtonModule],
  templateUrl: './back-end-page.component.html',
  styleUrl: './back-end-page.component.scss'
})
export class BackEndPageComponent {

  animation = inject(AnimationService);

}
