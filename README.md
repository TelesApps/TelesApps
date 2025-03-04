# Using AngularFire Firestore (Modular API)

This guide covers how to use the @angular/fire Firestore module with the Firebase v9 Modular API in an Angular application. It includes examples for both one-time reads and live real-time streams, along with common Firestore write operations and SSR considerations.

## Table of Contents
- [Installation & Setup](#installation--setup)
- [Configuration](#configuration)
- [Modular API Overview](#modular-api-overview)
- [Injecting the Firestore Instance](#injecting-the-firestore-instance)
- [Creating References](#creating-references)
- [Reading Data](#reading-data)
  - [One-Time Reads](#one-time-reads)
  - [Real-Time Streams](#real-time-streams)
- [Writing Data](#writing-data)
  - [Add a Document](#add-a-document)
  - [Set a Document](#set-a-document)
  - [Update a Document](#update-a-document)
  - [Delete a Document](#delete-a-document)
- [Querying](#querying)
- [SSR Considerations](#ssr-considerations)
- [Further Reading](#further-reading)

## Installation & Setup

Install Firebase and AngularFire (if you haven't already):

```bash
npm install firebase @angular/fire
```

Add Firebase config to your Angular environment files, for example:

```typescript
// environments/environment.ts
export const environment = {
  production: false,
  firebase: {
    apiKey: 'YOUR_API_KEY',
    authDomain: 'YOUR_AUTH_DOMAIN',
    projectId: 'YOUR_PROJECT_ID',
    storageBucket: 'YOUR_STORAGE_BUCKET',
    messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
    appId: 'YOUR_APP_ID',
  },
};
```

Initialize AngularFire by configuring the providers in your Angular app. For Angular v14+ with standalone APIs, you might do this in app.config.ts:

```typescript
// app.config.ts
import { ApplicationConfig } from '@angular/platform-browser';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    // Provide the Firebase App
    provideFirebaseApp(() => initializeApp(environment.firebase)),

    // Provide Firestore
    provideFirestore(() => getFirestore()),
  ],
};
```

If you're not using standalone APIs yet, you can still set this up in your AppModule with the imports array.

## Configuration

Once you've completed setup:

1. Inject the Firestore service in your components/services via Angular's DI.
2. Use the modular functions from @angular/fire/firestore for data reads, writes, and queries.

Example of injecting Firestore:

```typescript
import { Injectable } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';

@Injectable({ providedIn: 'root' })
export class ExampleService {
  constructor(private firestore: Firestore) {}

  // ...
}
```

## Modular API Overview

With the Firebase v9 Modular SDK, you create references with standalone functions like `doc(...)` or `collection(...)` and then pass them to other functions (e.g., `getDoc(...)`, `docData(...)`, etc.) to read or write data.

## Injecting the Firestore Instance

```typescript
constructor(private firestore: Firestore) {}
```

After injecting Firestore, you can create references to documents or collections by calling the modular helpers:

## Creating References

### Document Reference:

```typescript
import { doc } from '@angular/fire/firestore';
const docRef = doc(this.firestore, 'users', 'userId123');
```

### Collection Reference:

```typescript
import { collection } from '@angular/fire/firestore';
const collRef = collection(this.firestore, 'users');
```

## Reading Data

### One-Time Reads

For a one-time read, you can use `getDoc` or `getDocs`. These functions return Promises, so you'll typically wrap them in `from(...)` to convert them to an Observable if you prefer RxJS.

#### Single Document (one-time read)

```typescript
import { from } from 'rxjs';
import { map } from 'rxjs/operators';
import { doc, getDoc } from '@angular/fire/firestore';

getUserPortraitUrl(userId: string) {
  const docRef = doc(this.firestore, 'users', userId);
  return from(getDoc(docRef)).pipe(
    map(snapshot => {
      if (snapshot.exists()) {
        const data = snapshot.data() as { portraitUrl?: string };
        return data.portraitUrl;
      }
      return null;
    })
  );
}
```

#### Collection or Query (one-time read)

```typescript
import { from } from 'rxjs';
import { collection, getDocs } from '@angular/fire/firestore';

getAllUsers() {
  const collRef = collection(this.firestore, 'users');
  return from(getDocs(collRef)).pipe(
    map(querySnapshot => {
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
    })
  );
}
```

### Real-Time Streams

For live updates (real-time streams), @angular/fire provides RxJS-based helper functions:

#### docData

Streams the document's data (not the entire DocumentSnapshot), updating any time the document changes.

```typescript
import { doc, docData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

getUserLive$(userId: string): Observable<any> {
  const docRef = doc(this.firestore, 'users', userId);
  return docData(docRef, { idField: 'id' });
}
```

#### docSnapshots

Streams the DocumentSnapshot objects themselves (including metadata). Use this if you need snapshot.metadata, snapshot.id, etc.

```typescript
import { doc, docSnapshots } from '@angular/fire/firestore';

getUserSnapshot$(userId: string) {
  const docRef = doc(this.firestore, 'users', userId);
  return docSnapshots(docRef);
}
```

#### collectionData

Streams the documents' data in a collection or query, updating in real time.

```typescript
import { query, where, collection, collectionData } from '@angular/fire/firestore';

getTemplatesForPlayer$(playerId: string) {
  const collRef = collection(this.firestore, 'minion_templates');
  const q = query(collRef, where('templateCreator', '==', playerId));
  return collectionData(q, { idField: 'id' });
}
```

#### collectionSnapshots

Streams QuerySnapshot objects, useful if you need doc metadata or references.

```typescript
import { collection, collectionSnapshots } from '@angular/fire/firestore';

getCollectionSnapshots$() {
  const collRef = collection(this.firestore, 'users');
  return collectionSnapshots(collRef);
}
```

## Writing Data

These functions return Promises.

### Add a Document

```typescript
import { addDoc, collection } from '@angular/fire/firestore';

async createUser() {
  const collRef = collection(this.firestore, 'users');
  await addDoc(collRef, { name: 'New User', createdAt: new Date() });
}
```

### Set a Document

Overwrites (or creates) a document with a known ID:

```typescript
import { setDoc, doc } from '@angular/fire/firestore';

async setUser(userId: string, data: any) {
  const docRef = doc(this.firestore, 'users', userId);
  await setDoc(docRef, data);
}
```

### Update a Document

Updates an existing document's fields:

```typescript
import { updateDoc, doc } from '@angular/fire/firestore';

async updateUser(userId: string, partialData: Partial<any>) {
  const docRef = doc(this.firestore, 'users', userId);
  await updateDoc(docRef, partialData);
}
```

### Delete a Document

```typescript
import { deleteDoc, doc } from '@angular/fire/firestore';

async deleteUser(userId: string) {
  const docRef = doc(this.firestore, 'users', userId);
  await deleteDoc(docRef);
}
```

## Querying

Leverage `query`, `where`, `orderBy`, `limit`, etc. to form complex Firestore queries.

```typescript
import { query, where, orderBy, limit, collection, collectionData } from '@angular/fire/firestore';

getAdultsByName$() {
  const collRef = collection(this.firestore, 'users');
  const q = query(
    collRef,
    where('age', '>=', 18),
    orderBy('name', 'asc'),
    limit(10)
  );

  return collectionData(q, { idField: 'id' });
}
```

Available query constraints:

- `where(fieldPath, opStr, value)`
- `orderBy(fieldPath, direction?)`
- `limit(n)`
- `startAt(...)`, `startAfter(...)`, `endAt(...)`, `endBefore(...)` (for pagination scenarios).

## SSR Considerations

When using Angular Universal (server-side rendering), @angular/fire automatically handles many of the behind-the-scenes checks for browser vs. Node environments:

- Use the AngularFire providers in your top-level config (app.config.ts or AppModule).
- Avoid direct references to window or other browser globals in your Firestore code.
- If you need server-only logic or admin-level access, use Firebase Admin SDK on the server side (not in the client bundle).

## Further Reading

### AngularFire GitHub
https://github.com/angular/angularfire  
Check the /docs/firestore folder for additional examples and details.

### Firebase Firestore Docs
https://firebase.google.com/docs/firestore  
Official Firebase documentation on collections, documents, queries, etc.

### Angular SSR Docs
https://angular.io/guide/universal  
Official docs on creating universal (SSR) apps with Angular.
