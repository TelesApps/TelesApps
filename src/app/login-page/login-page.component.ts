import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-page',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatInputModule, MatIconModule, MatButtonModule],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss'
})
export class LoginPageComponent implements OnInit {

  loginForm: FormGroup;
  email: FormControl = new FormControl('', [Validators.required, Validators.email]);
  password: FormControl = new FormControl('', [Validators.required, Validators.minLength(6)]);
  errorMessage: string = '';


  constructor(private auth: AuthService, private router: Router) {
    this.loginForm = new FormGroup({
      email: this.email,
      password: this.password
    });
  }

  ngOnInit(): void {
    this.auth.user$.subscribe(user => {
      console.log('user from auth.user$', user);
      if (user) {
        this.router.navigate(['/tracker']);
      }
    });
  }

  onLogin() {

  }

  async onLoginWithGoogle() {
    try {
      console.log('Initiating Google login');
      await this.auth.signInWithGoogle();
      
      // Wait a moment for auth state to update
      setTimeout(() => {
        this.auth.user$.subscribe(user => {
          if (user) {
            console.log('Google login successful, navigating to tracker');
            this.router.navigate(['/tracker']);
          } else {
            console.error('Login successful but user data not available');
            this.errorMessage = 'Login successful, but unable to retrieve your profile. Please try again.';
          }
        });
      }, 500);
    } catch (err) {
      console.error('Google login failed:', err);
      this.errorMessage = 'Failed to login with Google. Please try again.';
    }
  }

}
