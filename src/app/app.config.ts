import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes),
  importProvidersFrom(provideFirebaseApp(() => initializeApp({
    "projectId": "danotes-a5289",
    "appId": "1:699715402794:web:8a8715835c6ba6be419753",
    "storageBucket": "danotes-a5289.appspot.com",
    "apiKey": "AIzaSyAzqKXC64U-i474iZRjkT7fDJgTvYAFmC8",
    "authDomain": "danotes-a5289.firebaseapp.com",
    "messagingSenderId": "699715402794"
  }))),
  importProvidersFrom(provideFirestore(() => getFirestore()))]
};
