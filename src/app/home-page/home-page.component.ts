import { Component } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import {MatToolbarModule} from '@angular/material/toolbar';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss'
})
export class HomePageComponent {

}
