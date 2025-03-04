import { ApplicationConfig, inject, PLATFORM_ID, REQUEST } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';

// Import from @angular/fire
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getAuth, provideAuth, setPersistence, browserLocalPersistence } from '@angular/fire/auth';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideClientHydration(),
    provideHttpClient(withFetch()),
    provideAnimations(),
    // Provide Firebase app
    provideFirebaseApp(() => {
      const app = initializeApp(environment.firebaseConfig);
      console.log('Firebase app initialized:', app.name);
      return app;
    }),
    // Provide Auth with persistence
    provideAuth(() => {
      const auth = getAuth();
      if (isPlatformBrowser(inject(PLATFORM_ID))) {
        setPersistence(auth, browserLocalPersistence)
          .then(() => console.log('Auth persistence set to LOCAL'))
          .catch(error => console.error('Error setting auth persistence:', error));
      }
      return auth;
    }),
    // Provide Firestore
    provideFirestore(() => {
      const firestore = getFirestore();
      console.log('Firestore initialized');
      return firestore;
    })
  ]
};