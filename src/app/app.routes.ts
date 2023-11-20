import { Routes } from '@angular/router';
import { HomePageComponent } from './home-page/home-page.component';
import { FrontEndPageComponent } from './front-end-page/front-end-page.component';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
    },
    {
        path: 'home',
        component: HomePageComponent
    },
    {
        path: 'front-end',
        component: FrontEndPageComponent
    },
    {
        path: '**',
        redirectTo: 'home'
    }
];
