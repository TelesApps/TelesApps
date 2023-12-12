import { Component, inject } from '@angular/core';
import { AnimationService } from '../services/animation.service';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-contact-page',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage, MatIconModule],
  templateUrl: './contact-page.component.html',
  styleUrls: ['../front-end-page/front-end-page.component.scss', './contact-page.component.scss']
})
export class ContactPageComponent {

  animation = inject(AnimationService);

}
