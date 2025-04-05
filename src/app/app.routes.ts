import { Routes } from '@angular/router';
import { HomePageComponent } from './home-page/home-page.component';
import { FrontEndPageComponent } from './front-end-page/front-end-page.component';
import { BackEndPageComponent } from './back-end-page/back-end-page.component';
import { DatabasePageComponent } from './database-page/database-page.component';
import { AiPageComponent } from './ai-page/ai-page.component';
import { ContactPageComponent } from './contact-page/contact-page.component';
import { BaFormatterComponent } from './ba-formatter/ba-formatter.component';
import { TrackerComponent } from './tracker/tracker.component';
import { authGuard } from './guards/auth.guard';

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
        path: 'contact',
        component: ContactPageComponent,
        data: { animation: 'contact' }
    },
    {
        path: 'baf',
        component: BaFormatterComponent,
    },
    {
        path: 'tracker',
        component: TrackerComponent,
        canActivate: [authGuard],
        children: [
            {
                path: 'record/:id',
                loadComponent: () => import('./tracker/record-details/record-details.component').then(m => m.RecordDetailsComponent)
            },
            {
                path: 'swim-record/:id',
                loadComponent: () => import('./tracker/record-details/record-details.component').then(m => m.RecordDetailsComponent)
            }
        ]
    },
    {
        path: 'login',
        loadComponent: () => import('./login-page/login-page.component').then(m => m.LoginPageComponent),
    },
    {
        path: '**',
        redirectTo: 'home'
    }
];
