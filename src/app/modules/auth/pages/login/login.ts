import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { RecaptchaV3Module, ReCaptchaV3Service } from 'ng-recaptcha';

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
      // RouterLink,
      RecaptchaV3Module
   ],
   changeDetection: ChangeDetectionStrategy.OnPush,
   templateUrl: './login.html',
   styleUrl: './login.css'
})
export class Login {
   private readonly authService = inject(AuthService);
   private readonly fb = inject(NonNullableFormBuilder);
   private readonly translate = inject(TranslateService);
   private readonly recaptchaV3Service = inject(ReCaptchaV3Service);
   private readonly router = inject(Router);
   private readonly route = inject(ActivatedRoute);

   showPassword = signal(false);
   isSubmitting = signal(false);
   errorMessage = signal<string | null>(null);
   captchaToken = signal<string | null>(null);

   loginForm: FormGroup = this.fb.group({
      entity: ['', Validators.required],
      password: ['', Validators.required],
      rememberMe: [false],
   });

   togglePassword = () => this.showPassword.update((v) => !v);

   onCaptchaResolved(token: string | null) {
      this.captchaToken.set(token);
      this.loginForm.get('recaptcha')?.setValue(token);
   };

   private async handleLogin(payload: LoginData): Promise<void> {
      try {
         await firstValueFrom(this.authService.login(payload));
         // await this.router.navigate(['/dashboard']);
      } catch (error: any) {
         console.log(error);
         let errorKey = 'auth.login.error';
         if (error?.status === 400) {
            if (error?.error?.error === 'Invalid request format') {
               errorKey = 'auth.errors.required';
            } else if (error?.error?.error === 'Invalid input') {
               errorKey = 'auth.errors.iranianPhone';
            }
         } else if (error?.status === 401) {
            if (error?.error?.error === 'Invalid recaptcha') {
               errorKey = 'auth.login.recaptchaError';
            } else if (error?.error?.error === 'User not found or inactive') {
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
      };

      this.isSubmitting.set(true);
      this.errorMessage.set(null);

      const token = await firstValueFrom(this.recaptchaV3Service.execute('login'));

      const { entity, password, rememberMe } = this.loginForm.getRawValue();
      const payload: LoginData = { entity, password, rememberMe, recaptchaToken: token };

      await this.handleLogin(payload);

      await this.router.navigateByUrl(
         this.route.snapshot.queryParams['returnUrl'] || '/'
      );
   }
}