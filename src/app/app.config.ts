import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { initializeApp } from 'firebase/app';
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDlLKHGBCmJea2aDAblXobANWgX6wto55E",
  authDomain: "telesapps-c8f5a.firebaseapp.com",
  projectId: "telesapps-c8f5a",
  storageBucket: "telesapps-c8f5a.appspot.com",
  messagingSenderId: "1095550930048",
  appId: "1:1095550930048:web:9c6f8462bcfc71bbbdaa65",
  measurementId: "G-ZZ1MP3DF02"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes), provideClientHydration(), provideAnimations()]
};
