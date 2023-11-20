import { Component } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import {MatToolbarModule} from '@angular/material/toolbar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';


@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage, MatProgressSpinnerModule, MatButtonModule, RouterModule],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss'
})
export class HomePageComponent {

}
