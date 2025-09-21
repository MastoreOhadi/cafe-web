import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { finalize } from 'rxjs';

import { NavigationBarComponent } from '../../../../core/components/navigation-bar/navigation-bar';
import { AuthService, LoginData } from '../../../../core/services/auth/auth.service';
import { ZardButtonComponent } from '@shared/ui/button/button.component';

@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    NavigationBarComponent,
    ZardButtonComponent,
    RouterLink
  ],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private translate = inject(TranslateService);

  loginForm: FormGroup = this.fb.group({
    entity: ['', Validators.required],
    password: ['', Validators.required],
    rememberMe: [false]
  });

  // Signals for UI state
  showPassword = signal(false);
  isSubmitting = signal(false);
  errorMessage = signal<string | null>(null);

  togglePassword(): void {
    this.showPassword.update(v => !v);
  }

  private markAllTouched(): void {
    Object.values(this.loginForm.controls).forEach(control => {
      control.markAsTouched();
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.markAllTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const { entity, password, rememberMe } = this.loginForm.value;
    const payload: LoginData = {
      entity,
      password,
	  rememberMe
    };

    this.authService.login(payload).pipe(
      finalize(() => this.isSubmitting.set(false))
    ).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']); // یا مسیر مورد نظر بعد از لاگین
      },
      error: (error) => {
        this.errorMessage.set(error.message || this.translate.instant('auth.login.error'));
      }
    });
  }
}