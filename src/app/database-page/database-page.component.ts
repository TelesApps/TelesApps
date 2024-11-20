import { Component, inject } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { AnimationService } from '../services/animation.service';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'app-database-page',
    imports: [CommonModule, NgOptimizedImage, MatButtonModule],
    templateUrl: './database-page.component.html',
    styleUrls: ['../front-end-page/front-end-page.component.scss', './database-page.component.scss',]
})
export class DatabasePageComponent {

  animation = inject(AnimationService);

}
