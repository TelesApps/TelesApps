import { Component, inject } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { AnimationService } from '../services/animation.service';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-ai-page',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage, MatButtonModule],
  templateUrl: './ai-page.component.html',
  styleUrls: ['../back-end-page/back-end-page.component.scss', './ai-page.component.scss']
})
export class AiPageComponent {

  animation = inject(AnimationService);

}
