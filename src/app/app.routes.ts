import { Routes } from '@angular/router';
import { HomePageComponent } from './home-page/home-page.component';
import { FrontEndPageComponent } from './front-end-page/front-end-page.component';
import { BackEndPageComponent } from './back-end-page/back-end-page.component';
import { DatabasePageComponent } from './database-page/database-page.component';
import { AiPageComponent } from './ai-page/ai-page.component';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
    },
    {
        path: 'home',
        component: HomePageComponent,
        data: { animation: 'home', type: '' }
    },
    {
        path: 'front-end',
        component: FrontEndPageComponent,
        data: { animation: 'front-end' }
    },
    {
        path: 'back-end',
        component: BackEndPageComponent,
        data: { animation: 'back-end' }
    },
    {
        path: 'database',
        component: DatabasePageComponent,
        data: { animation: 'database' }
    },
    {
        path: 'ai',
        component: AiPageComponent,
        data: { animation: 'ai' }
    },
    {
        path: '**',
        redirectTo: 'home'
    }
];
