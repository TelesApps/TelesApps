import { Injectable } from '@angular/core';
import {
  Auth,
  authState,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  TwitterAuthProvider,
  GithubAuthProvider,
  signOut,
  UserCredential,
  AuthProvider,
  sendPasswordResetEmail
} from '@angular/fire/auth';
import { Firestore, doc, docData, setDoc, getDoc, collection, query, where, getDocs, onSnapshot } from '@angular/fire/firestore';
import { Observable, of, from } from 'rxjs';
import { map, switchMap, catchError, take } from 'rxjs/operators';
import { Router } from '@angular/router';
import { CreateUser, UserData } from '../interfaces/user-data.interface';
import { environment } from '../../environments/environment';
import { JoggingRecord, SwimRecord } from '../interfaces/tracker.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user$: Observable<UserData | null>;
  
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
  
  // Get user data from Firestore
  async getUserData(userId: string): Promise<UserData | null> {
    try {
      const docRef = doc(this.firestore, 'users', userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        console.log('User document found');
        const data = docSnap.data() as UserData;
        return data;
      } else {
        console.log('User document not found');
        return null;
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  }

  // Register a new user with email and password
  async registerWithEmailAndPassword(email: string, password: string, displayName: string): Promise<void> {
    try {
      const credential = await createUserWithEmailAndPassword(this.auth, email, password);
      console.log('User registered successfully:', credential.user.uid);
      
      // Create user data
      const userData = CreateUser(
        credential.user.uid,
        displayName,
        email,
        credential.user.emailVerified,
        credential.user.photoURL || ''
      );
      
      // Save to Firestore
      await this.updateUserData(userData);
      
      // Send verification email
      await sendEmailVerification(credential.user, environment.actionCodeSettings);
      
      return;
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  }
  
  // Sign in with email and password
  async loginWithEmailAndPassword(email: string, password: string): Promise<UserCredential> {
    try {
      const credential = await signInWithEmailAndPassword(this.auth, email, password);
      console.log('User logged in successfully:', credential.user.uid);
      return credential;
    } catch (error) {
      console.error('Error logging in with email/password:', error);
      throw error;
    }
  }
  
  // Send password reset email
  async sendPasswordReset(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(this.auth, email, environment.actionCodeSettings);
      console.log('Password reset email sent');
      return;
    } catch (error) {
      console.error('Error sending password reset:', error);
      throw error;
    }
  }
  
  // Resend verification email
  async resendVerificationEmail(email: string): Promise<void> {
    try {
      const user = this.auth.currentUser;
      if (user) {
        await updateEmail(user, email);
        await sendEmailVerification(user, environment.actionCodeSettings);
        console.log('Verification email sent');
        return;
      } else {
        throw new Error('No user is logged in');
      }
    } catch (error) {
      console.error('Error sending verification email:', error);
      throw error;
    }
  }

  // Generic OAuth login method
  private async oAuthLogin(provider: AuthProvider): Promise<UserCredential> {
    try {
      console.log(`OAuth login with provider: ${provider.providerId}`);
      const credential = await signInWithPopup(this.auth, provider);
      console.log('OAuth login successful, user ID:', credential.user.uid);

      // For now limit who can login to myself
      if (credential.user.email !== 'claudioteles85@gmail.com') {
        console.error('Unauthorized user ID:', credential.user.uid);
        throw new Error('Unauthorized! Please contact Claudio Teles to receive althorization');
      }
      
      // Check if user exists
      const userData = await this.getUserData(credential.user.uid);
      
      if (!userData) {
        console.log('User document does not exist, creating new profile');
        const newUserData = CreateUser(
          credential.user.uid,
          credential.user.displayName || '',
          credential.user.email || '',
          credential.user.emailVerified,
          credential.user.photoURL || ''
        );
        
        await this.updateUserData(newUserData);
        console.log('User document created successfully');
      } else {
        console.log('User document already exists');
        // Update photo URL if needed
        if ((!userData.photoURL || userData.photoURL === '') && credential.user.photoURL) {
          userData.photoURL = credential.user.photoURL;
          await this.updateUserData(userData);
        }
      }
      
      return credential;
    } catch (error: any) {
      // Handle rejection because firestore rules rejected access
      if (error.code === 'auth/popup-closed-by-user') {
        console.error('OAuth popup closed by user');
        throw error;
      }
      
      
      console.error(`Error during ${provider.providerId} sign-in:`, error);
      throw error;
    }
  }

  // Specific social login methods
  async signInWithGoogle(): Promise<UserCredential> {
    const provider = new GoogleAuthProvider();
    provider.addScope('profile');
    provider.addScope('email');
    provider.setCustomParameters({ prompt: 'select_account' });
    return this.oAuthLogin(provider);
  }
  
  async signInWithFacebook(): Promise<UserCredential> {
    const provider = new FacebookAuthProvider();
    provider.addScope('email');
    provider.addScope('public_profile');
    return this.oAuthLogin(provider);
  }
  
  async signInWithTwitter(): Promise<UserCredential> {
    const provider = new TwitterAuthProvider();
    return this.oAuthLogin(provider);
  }
  
  async signInWithGithub(): Promise<UserCredential> {
    const provider = new GithubAuthProvider();
    provider.addScope('user');
    return this.oAuthLogin(provider);
  }

  // Update user data in Firestore
  async updateUserData(userData: UserData): Promise<void> {
    try {
      console.log('Updating user data:', userData);
      const userRef = doc(this.firestore, 'users', userData.userId);
      
      await setDoc(userRef, userData, { merge: true });
      
      console.log('User data updated successfully');
    } catch (error) {
      console.error('Error updating user data:', error);
      throw error;
    }
  }

  // Update run-records in Firestore
  async updateRunRecord(runRecord: JoggingRecord): Promise<void> {
    try {
      console.log('Updating run record:', runRecord);
      
      // If the record doesn't have an ID (new record), create one
      if (!runRecord.id) {
        const email = this.auth.currentUser?.email || 'unknown';
        const timestamp = new Date().toISOString();
        runRecord.id = `${email}_${timestamp}`;
      }
      
      const runRecordRef = doc(this.firestore, 'run-records', runRecord.id);
      await setDoc(runRecordRef, runRecord, { merge: true });
      console.log('Run record updated successfully');
    } catch (error) {
      console.error('Error updating run record:', error);
      throw error;
    }
  }

  async updateSwimRecord(swimRecord: SwimRecord): Promise<void> {
    try {
      console.log('Updating swim record:', swimRecord);
      
      // If the record doesn't have an ID (new record), create one
      if (!swimRecord.id) {
        const email = this.auth.currentUser?.email || 'unknown';
        const timestamp = new Date().toISOString();
        swimRecord.id = `${email}_${timestamp}`;
      }
      
      const swimRecordRef = doc(this.firestore, 'swim-records', swimRecord.id);
      await setDoc(swimRecordRef, swimRecord, { merge: true });
      console.log('Swim record updated successfully');
    } catch (error) {
      console.error('Error updating swim record:', error);
      throw error;
    }
  }

  // Get all run-records for a specific user
  getUserRunRecords(userId: string): Observable<JoggingRecord[]> {
    return new Observable<JoggingRecord[]>(observer => {
      try {
        // Create a reference to the run-records collection
        const runRecordsRef = collection(this.firestore, 'run-records');
        
        // Create a query against the collection to filter by userId
        const q = query(runRecordsRef, where('userId', '==', userId));
        
        // Set up a real-time listener
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          // Map the documents to JoggingTracker objects
          const runRecords: JoggingRecord[] = [];
          querySnapshot.forEach((doc) => {
            const data = doc.data() as JoggingRecord;
            // Ensure the id is set from the document id
            data.id = doc.id;
            runRecords.push(data);
          });
          
          console.log(`Retrieved ${runRecords.length} run records for user ${userId}`);
          observer.next(runRecords);
        }, error => {
          console.error('Error getting user run records:', error);
          observer.error(error);
        });
        
        // Return the unsubscribe function to clean up when the observable is unsubscribed
        return unsubscribe;
      } catch (error) {
        console.error('Error setting up run records listener:', error);
        observer.error(error);
        // Return a no-op function for the unsubscribe
        return () => {};
      }
    });
  }

  // Get all swim-records for a specific user
  getUserSwimRecords(userId: string): Observable<SwimRecord[]> {
    return new Observable<SwimRecord[]>(observer => {
      try {
        // Create a reference to the swim-records collection
        const swimRecordsRef = collection(this.firestore, 'swim-records');
        
        // Create a query against the collection to filter by userId
        const q = query(swimRecordsRef, where('userId', '==', userId));
        
        // Set up a real-time listener
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          // Map the documents to SwimRecord objects
          const swimRecords: SwimRecord[] = [];
          querySnapshot.forEach((doc) => {
            const data = doc.data() as SwimRecord;
            // Ensure the id is set from the document id
            data.id = doc.id;
            swimRecords.push(data);
          });
          
          console.log(`Retrieved ${swimRecords.length} swim records for user ${userId}`);
          observer.next(swimRecords);
        }, error => {
          console.error('Error getting user swim records:', error);
          observer.error(error);
        });
        
        // Return the unsubscribe function to clean up when the observable is unsubscribed
        return unsubscribe;
      } catch (error) {
        console.error('Error setting up swim records listener:', error);
        observer.error(error);
        // Return a no-op function for the unsubscribe
        return () => {};
      }
    });
  }

  // Log out
  async logOut(): Promise<void> {
    try {
      await signOut(this.auth);
      console.log('User logged out successfully');
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  }
}