import { Injectable, inject } from '@angular/core';
import {
  Auth,
  authState,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut
} from '@angular/fire/auth';

import {
  Firestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  query,
  where
} from '@angular/fire/firestore';

import { Observable, of, from } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { CreateUser, User } from '../interfaces/user.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user$: Observable<User | null>;

  constructor(
    public auth: Auth,
    private firestore: Firestore,
    private router: Router
  ) {
    console.log('AuthService initializing');

    // Debug raw auth state
    authState(this.auth).subscribe(authUser => {
      console.log('Auth state changed:', authUser?.uid || 'No user');
    });

    // Create user$ using a more direct approach
    this.user$ = authState(this.auth).pipe(
      switchMap(user => {
        if (!user) {
          console.log('No authenticated user');
          return of(null);
        }

        console.log('Auth user found, fetching Firestore data:', user.uid);

        // Convert the document fetch to a promise, then to an observable
        return from(this.getUserData(user.uid));
      })
    );

    // Debug the user$ observable
    this.user$.subscribe(user => {
      console.log('user$ value updated:', user?.userId || 'null');
    });
  }

  // Create a method that directly uses promises instead of observables
  async getUserData(userId: string): Promise<User | null> {
    try {
      const docRef = doc(this.firestore, 'users', userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        console.log('User document found');
        const data = docSnap.data() as User;
        return {
          ...data,
          userId // Ensure userId is present
        };
      } else {
        console.log('User document not found');
        return null;
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  }

  async signInWithGoogle() {
    try {
      console.log('Google sign-in initiated');
      const provider = new GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');
      provider.setCustomParameters({ prompt: 'select_account' });

      const result = await signInWithPopup(this.auth, provider);
      console.log('Google sign-in successful, user ID:', result.user.uid);

      // Check if user exists
      const userData = await this.getUserData(result.user.uid);

      if (!userData) {
        console.log('User document does not exist, creating new profile');
        const newUserData = CreateUser(
          result.user.uid,
          result.user.displayName || '',
          result.user.email || '',
          result.user.emailVerified,
          result.user.photoURL || ''
        );

        await this.updateUserData(newUserData);
        console.log('User document created successfully');
      } else {
        console.log('User document already exists');
      }

      return result;
    } catch (error) {
      console.error('Error during Google sign-in:', error);
      throw error;
    }
  }

  async updateUserData(userData: User) {
    try {
      console.log('Updating user data:', userData);
      const docRef = doc(this.firestore, 'users', userData.userId);
      await setDoc(docRef, { userData }, { merge: true });

      console.log('User data updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating user data:', error);
      throw error;
    }
  }

  // Keep your other methods...

  logOut() {
    return signOut(this.auth).then(() => {
      console.log('User has been logged out');
      this.router.navigate(['/login']);
    });
  }
}