import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule, NgClass, NgIf } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { debounceTime, distinctUntilChanged, finalize, firstValueFrom } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { NavigationBarComponent } from '../../../../core/components/navigation-bar/navigation-bar';
import { AuthService, PhoneVerificationData, RegisterData, ResendOtpData } from '../../../../core/services/auth/auth.service';
import { CustomValidators } from '../../../../core/validators/custom-validators';
import { toSignal } from '@angular/core/rxjs-interop';
import { CitySelectorComponent } from '../../components/city/city-selector.component';
import { ZardButtonComponent } from '@shared/ui/button/button.component';
import { Router } from '@angular/router';
import { PhoneFormatPipe } from "../../../../core/pipes/phone-format.pipe";
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';

// function calculatePasswordStrength(password: string): number {
// //    let score = 0;
// //    if (password.length >= 8) score++;
// //    if (/[A-Z]/.test(password)) score++;
// //    if (/[0-9]/.test(password)) score++;
// //    if (/[^A-Za-z0-9]/.test(password)) score++;

// //    return score;
// // };

interface PasswordStrength {
  score: number;
  text: string;
};

@Component({
   selector: 'app-register',
   imports: [
      NgClass, ReactiveFormsModule, TranslateModule,
      NavigationBarComponent, CitySelectorComponent,
      ZardButtonComponent,
      PhoneFormatPipe, NgxMaskDirective
   ],
   providers: [provideNgxMask()],
   changeDetection: ChangeDetectionStrategy.OnPush,
   templateUrl: './register.html',
   styleUrl: './register.css'
})
export class Register {
   private authService = inject(AuthService);
   private fb = inject(FormBuilder);
   private translate = inject(TranslateService);
   // private router = inject(Router);

   authStep = signal<'register' | 'otp'>('register');
   phoneNumber = signal<string>('');

   registerForm: FormGroup = this.fb.nonNullable.group({
      fullName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      phone: ['', [Validators.required, Validators.pattern(/^09\d{9}$/)]],
      city: ['', [Validators.required, Validators.minLength(2)]],
      password: ['', [
         Validators.required, Validators.minLength(8), // CustomValidators.passwordStrength
      ]],
      confirmPassword: ['', Validators.required],
      acceptTerms: [false, Validators.requiredTrue]
   }, {
      validators: [CustomValidators.match('password', 'confirmPassword')]
   });

   otpForm: FormGroup = this.fb.nonNullable.group({
      otp: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
   });

   showPassword = signal(false);
   showConfirmPassword = signal(false);
   isSubmitting = signal(false);
   isResending = signal(false);
   errorMessage = signal<string | null>(null);
   successMessage = signal<string | null>(null);


   private passwordValue = toSignal(this.registerForm.get('password')!.valueChanges, { initialValue: '' });

   passwordStrength = computed<PasswordStrength>(() => {
      const pwd = this.passwordValue();
      if (!pwd) return { score: 0, text: '' };

      let score = 0;
      if (pwd.length >= 8) score++;
      if (/[A-Z]/.test(pwd)) score++;
      if (/[0-9]/.test(pwd)) score++;
      if (/[^A-Za-z0-9]/.test(pwd)) score++;

      // choose translation key once when computed changes
      const texts = [
         this.translate.instant('auth.passwordStrength.veryWeak'),
         this.translate.instant('auth.passwordStrength.weak'),
         this.translate.instant('auth.passwordStrength.medium'),
         this.translate.instant('auth.passwordStrength.strong'),
         this.translate.instant('auth.passwordStrength.veryStrong')
      ] as const;

      return { score, text: texts[Math.min(score, texts.length - 1)] };
   });

   constructor() {
      // Real-time phone validation (cleaner with takeUntilDestroyed)
      this.registerForm.get('phone')?.valueChanges.pipe(
         debounceTime(300),
         distinctUntilChanged(),
         takeUntilDestroyed()
      ).subscribe((value: string) => {
         if (!value) {
            const ctrl = this.registerForm.get('phone');
            if (ctrl?.hasError('iranianPhone')) ctrl.updateValueAndValidity({ onlySelf: true, emitEvent: false });

            return;
         }

         if (!/^09\d{9}$/.test(value)) {
            this.registerForm.get('phone')?.setErrors({ iranianPhone: true });
         } else {
            // if previously had iranianPhone error, clear it without touching other errors
            const ctrl = this.registerForm.get('phone');
            if (ctrl?.errors) {
               const { iranianPhone, ...rest } = ctrl.errors;
               const newErrors = Object.keys(rest).length ? rest : null;
               ctrl.setErrors(newErrors);
            };
         };
      });
   };

   togglePassword(field: 'password' | 'confirm'): void {
      if (field === 'password') this.showPassword.update(v => !v);
      else this.showConfirmPassword.update(v => !v);
   };

   private calculatePasswordStrength(password: string): PasswordStrength {
      if (!password) return { score: 0, text: '' };

      let score = 0;
      if (password.length >= 8) score++;
      if (/[A-Z]/.test(password)) score++;
      if (/[0-9]/.test(password)) score++;
      if (/[^A-Za-z0-9]/.test(password)) score++;

      const texts = [
         this.translate.instant('auth.passwordStrength.veryWeak'),
         this.translate.instant('auth.passwordStrength.weak'),
         this.translate.instant('auth.passwordStrength.medium'),
         this.translate.instant('auth.passwordStrength.strong'),
         this.translate.instant('auth.passwordStrength.veryStrong')
      ];

      return {
         score, text: texts[score],
      };
   };

   private mapErrorToMessage(error: any, type: 'register' | 'otp' | 'resend'): string {
      if (!error) return this.translate.instant(`auth.${type}.error`);

      if (type === 'register') {
         if (error.status === 409 && error.error?.error?.includes('Phone number already registered')) {
            return this.translate.instant('auth.register.phoneAlreadyRegistered');
         }
         if (error.status === 429 && error.error?.error?.includes('Phone number is temporarily blocked')) {
            return this.translate.instant('auth.otp.phoneBlocked');
         }
      } else if (type === 'otp') {
         if (error.status === 401) {
            const errText: string = error.error?.error ?? '';
            if (errText.includes('Invalid OTP')) {
               const match = errText.match(/Attempts left:\s*(\d+)/);
               if (match) return this.translate.instant('auth.otp.invalidCode', { attemptsLeft: match[1] });
            }
            if (errText.includes('OTP has expired')) return this.translate.instant('auth.otp.otpExpired');
            if (errText.includes('Sign-up session expired')) return this.translate.instant('auth.otp.sessionExpired');
         }
         if (error.status === 429) {
            if (error.error?.error?.includes('Phone is temporarily blocked')) return this.translate.instant('auth.otp.phoneBlocked');
            if (error.error?.error?.includes('Maximum OTP attempts exceeded')) return this.translate.instant('auth.otp.maxAttempts');
         }
      } else if (type === 'resend') {
         if (error.status === 401 && error.error?.error?.includes('Sign-up session expired')) return this.translate.instant('auth.otp.sessionExpired');
         if (error.status === 429) {
            const err = error.error?.error ?? '';
            if (err.includes('Phone is temporarily blocked')) return this.translate.instant('auth.otp.phoneBlocked');
            if (err.includes('Please wait before requesting new OTP')) return this.translate.instant('auth.otp.cooldown');
            if (err.includes('Hourly OTP limit exceeded')) return this.translate.instant('auth.otp.hourLimitExceeded');
            if (err.includes('Daily OTP limit exceeded')) return this.translate.instant('auth.otp.dayLimitExceeded');
         };
      };

      return this.translate.instant(`auth.${type}.error`);
   };

   changePhone(): void {
      this.authStep.set('register');
      this.otpForm.reset();
      this.errorMessage.set(null);
      this.successMessage.set(null);
   }

   async onRegisterSubmit(): Promise<void> {
      if (this.registerForm.invalid) {
         this.registerForm.markAllAsTouched();
         return;
      }

      this.isSubmitting.set(true);
      this.errorMessage.set(null);
      this.successMessage.set(null);

      try {
         const { fullName, phone, city, password } = this.registerForm.getRawValue();
         const payload: RegisterData = {
            full_name: fullName,
            phone: phone,
            city: city.cityId,
            province: city.provinceId,
            password: password
         };

         await firstValueFrom(this.authService.register(payload));
         this.successMessage.set(this.translate.instant('auth.register.success'));
         this.phoneNumber.set(phone);
         this.authStep.set('otp');
      } catch (error: any) {
         this.errorMessage.set(this.mapErrorToMessage(error, 'register'));
      } finally {
         this.isSubmitting.set(false);
      };
   }

   async onOtpSubmit(): Promise<void> {
      if (this.otpForm.invalid) {
         this.otpForm.markAllAsTouched();
         return;
      };

      this.isSubmitting.set(true);
      this.errorMessage.set(null);

      try {
         const payload: PhoneVerificationData = {
            phone: this.phoneNumber(),
            otp: this.otpForm.value.otp
         };

         await firstValueFrom(this.authService.verifyPhone(payload));
         this.successMessage.set(this.translate.instant('auth.otp.success'));
      } catch (error: any) {
         this.errorMessage.set(this.mapErrorToMessage(error, 'otp'));

         if (error?.error?.error?.includes('Sign-up session expired')) {
            setTimeout(() => this.authStep.set('register'), 1400);
         };
      } finally {
         this.isSubmitting.set(false);
      };
   };

   async resendOtp(): Promise<void> {
      this.isSubmitting.set(true);
      this.errorMessage.set(null);

      try {
         await firstValueFrom(this.authService.resendPhoneOtp({ phone: this.phoneNumber() }));
         this.successMessage.set(this.translate.instant('auth.otp.resent'));
      } catch (err: any) {
         this.errorMessage.set(this.mapErrorToMessage(err, 'resend'));

         if (err?.error?.error?.includes('Sign-up session expired')) {
            setTimeout(() => this.authStep.set('register'), 1200);
         };
      } finally {
         this.isSubmitting.set(false);
      };
   };
};
