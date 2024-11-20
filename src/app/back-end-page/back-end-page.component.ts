import { Component, inject } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { AnimationService } from '../services/animation.service';
import { ApiService } from '../services/api.service';

@Component({
    selector: 'app-back-end-page',
    imports: [CommonModule, NgOptimizedImage, MatButtonModule],
    templateUrl: './back-end-page.component.html',
    styleUrl: './back-end-page.component.scss'
})
export class BackEndPageComponent {

  animation = inject(AnimationService);
  api = inject(ApiService);

  testAPI() {
    this.api.get_notifyUser().subscribe((res) => {
      console.log(res);
    });
  }

}
