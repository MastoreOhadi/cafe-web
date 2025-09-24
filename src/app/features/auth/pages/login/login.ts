import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';

import { NavigationBarComponent } from '../../../../core/components/navigation-bar/navigation-bar';
import { AuthService, LoginData } from '../../../../core/services/auth/auth.service';
import { ZardButtonComponent } from '@shared/ui/button/button.component';

@Component({
   selector: 'app-login',
   imports: [
      ReactiveFormsModule,
      TranslateModule,
      NavigationBarComponent,
      ZardButtonComponent,
      RouterLink
   ],
   changeDetection: ChangeDetectionStrategy.OnPush,
   templateUrl: './login.html',
   styleUrl: './login.css'
})
export class Login {
   private readonly authService = inject(AuthService);
   private readonly fb = inject(NonNullableFormBuilder);
   private readonly router = inject(Router);
   private readonly translate = inject(TranslateService);

   showPassword = signal(false);
   isSubmitting = signal(false);
   errorMessage = signal<string | null>(null);

   loginForm: FormGroup = this.fb.group({
      entity: ['', Validators.required],
      password: ['', Validators.required],
      rememberMe: [false]
   });

   togglePassword = () => this.showPassword.update((v) => !v);

   private async handleLogin(payload: LoginData): Promise<void> {
      try {
         await firstValueFrom(this.authService.login(payload));
         await this.router.navigate(['/dashboard']);
      } catch (error: any) {
         let errorKey = 'auth.login.error';
         if (error?.status === 400) {
            if (error?.error?.error === 'Invalid request format') {
               errorKey = 'auth.errors.required';
            } else if (error?.error?.error === 'Invalid input') {
               errorKey = 'auth.errors.iranianPhone';
            }
         } else if (error?.status === 401) {
            if (error?.error?.error === 'User not found or inactive') {
               errorKey = 'auth.login.phoneNotFound';
            } else if (error?.error?.error === 'Account temporarily locked') {
               errorKey = 'auth.login.accountLocked';
            } else if (error?.error?.error === 'Invalid credentials') {
               errorKey = 'auth.login.invalidCredentials';
            }
         } else if (error?.status === 500) {
            errorKey = 'auth.login.serviceUnavailable';
         }

         this.errorMessage.set(this.translate.instant(errorKey));
      } finally {
         this.isSubmitting.set(false);
      }
   }

   async onSubmit(): Promise<void> {
      if (this.loginForm.invalid) {
         this.loginForm.markAllAsTouched();
         return;
      }

      this.isSubmitting.set(true);
      this.errorMessage.set(null);

      const { entity, password, rememberMe } = this.loginForm.getRawValue();
      const payload: LoginData = { entity, password, rememberMe };

      await this.handleLogin(payload);
   }
}