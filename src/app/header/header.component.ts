import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { NavLinksComponent } from '../components/nav-links/nav-links.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, MatToolbarModule, MatIconModule, RouterModule, NavLinksComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {

  logoSrc: string = 'assets/images/logo-white-250px.png'
  @Output() openNavBar = new EventEmitter();

  onOpenNavbar() {
    console.log('open');
    // this.valueChanged.emit('open');
  }

}
