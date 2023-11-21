import { Component } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-front-end-page',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage],
  templateUrl: './front-end-page.component.html',
  styleUrl: './front-end-page.component.scss'
})
export class FrontEndPageComponent {

}
