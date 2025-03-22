import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { Route } from '../../../interfaces/tracker.interface';
import { MatListModule } from '@angular/material/list';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

// create an interface specific to dialog simply to add the isSelected property to the route interface
interface RouteDialog extends Route {
  isSelected: boolean;
}

@Component({
  selector: 'app-routes-dialog',
  imports: [CommonModule, MatDialogModule, MatListModule, MatCheckboxModule, MatIconModule, MatButtonModule],
  templateUrl: './routes-dialog.component.html',
  styleUrl: './routes-dialog.component.scss'
})
export class RoutesDialogComponent {

  data = inject(MAT_DIALOG_DATA);
  routes: RouteDialog[] = this.data.routes.map((route: Route) => ({ ...route, isSelected: false }));
  selectedRoutes: RouteDialog[] = [];
  totalDistance: { miles: number, kilometers: number } = { miles: 0, kilometers: 0 };
  lakeLoopLaps = 0;

  constructor() {
    console.log('dialog data', this.data);
    this.selectedRoutes = this.data.selectedRoutes;
    console.log('selected routes', this.selectedRoutes);
    this.routes.forEach((route) => {
      if (this.selectedRoutes.some((selected) => selected.slug === route.slug)) {
        route.isSelected = true;
      }
    });
    this.selectedRoutes.forEach((route) => {
      route['isSelected'] = true;
      if (route.slug === 'lakeLoop') this.lakeLoopLaps++;
    });
    this.calculateRoute();
  }

  calculateRoute() {
    if (this.lakeLoopLaps < 0) this.lakeLoopLaps = 0;
    console.log('this.routes', this.routes);
    this.totalDistance = { miles: 0, kilometers: 0 };
    this.selectedRoutes = [];
    this.routes.forEach((route) => {
      if (route.isSelected) {
        if (route.slug === 'lakeLoop') {
          for (let i = 0; i < this.lakeLoopLaps; i++) {
            this.selectedRoutes.push(route);
          }
        } else {
          this.selectedRoutes.push(route);
        }
      }
    });
    this.selectedRoutes.forEach((route) => {
      this.totalDistance.miles += route.miles;
      this.totalDistance.kilometers += route.kilometers;
    });


  }
}
