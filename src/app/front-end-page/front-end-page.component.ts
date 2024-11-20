import { Component, inject } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { AnimationService } from '../services/animation.service';

@Component({
    selector: 'app-front-end-page',
    imports: [CommonModule, NgOptimizedImage, MatButtonModule],
    templateUrl: './front-end-page.component.html',
    styleUrl: './front-end-page.component.scss'
})
export class FrontEndPageComponent {

  animation = inject(AnimationService);
}
