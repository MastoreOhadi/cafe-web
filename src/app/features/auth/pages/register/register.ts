import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { debounceTime, distinctUntilChanged, finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { NavigationBarComponent } from '../../../../core/components/navigation-bar/navigation-bar';
import { AuthService, RegisterData } from '../../../../core/services/auth/auth.service';
import { CustomValidators } from '../../../../core/validators/custom-validators';
import { toSignal } from '@angular/core/rxjs-interop';
import { CitySelectorComponent } from '../../components/city/city-selector.component';
import { ZardButtonComponent } from '@shared/ui/button/button.component';

@Component({
  selector: 'app-register',
  imports: [
   NgClass, ReactiveFormsModule, TranslateModule,
   NavigationBarComponent, CitySelectorComponent,
   ZardButtonComponent],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
   private authService = inject(AuthService);
   private fb = inject(FormBuilder);
   private translate = inject(TranslateService);

   registerForm: FormGroup = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      phone: ['', [Validators.required, CustomValidators.iranianPhone]],
      city: ['', [Validators.required, Validators.minLength(2)]],
      password: ['', [
         Validators.required,
         Validators.minLength(8),
         CustomValidators.passwordStrength
      ]],
      confirmPassword: ['', Validators.required],
      acceptTerms: [false, Validators.requiredTrue]
   }, {
      validators: [CustomValidators.match('password', 'confirmPassword')]
   });

   password = toSignal(this.registerForm.get('password')!.valueChanges, { initialValue: '' });

   // Signals for UI state
   showPassword = signal(false);
   showConfirmPassword = signal(false);
   isSubmitting = signal(false);
   errorMessage = signal<string | null>(null);
   successMessage = signal<string | null>(null);

   passwordStrength = computed(() => {
      const password = this.password();
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

      return { score, text: texts[score] };
   });


   constructor() {
      // Real-time phone validation (cleaner with takeUntilDestroyed)
      this.registerForm.get('phone')?.valueChanges.pipe(
         debounceTime(300),
         distinctUntilChanged(),
         takeUntilDestroyed()
      ).subscribe(value => {
         if (value && !/^09\d{9}$/.test(value)) {
         this.registerForm.get('phone')?.setErrors({ iranianPhone: true });
         }
      });
   }

   togglePassword(type: 'password' | 'confirm'): void {
      if (type === 'password') {
         this.showPassword.update(v => !v);
      } else {
         this.showConfirmPassword.update(v => !v);
      }
   }

   private markAllTouched(): void {
      Object.values(this.registerForm.controls).forEach(control => {
         control.markAsTouched();
      });
   }

   onSubmit(): void {
      if (this.registerForm.invalid) {
         this.markAllTouched();
         return;
      }

      this.isSubmitting.set(true);
      this.errorMessage.set(null);
      this.successMessage.set(null);

      const { fullName, phone, city, password } = this.registerForm.value;
      const payload: RegisterData = {
         name: fullName,
         phone: phone,
         city: city.cityId,
         province: city.provinceId,
         password: password
      };
      console.log(payload)

      this.authService.register(payload).pipe(
         finalize(() => this.isSubmitting.set(false))
      ).subscribe({
         next: () => {
         this.successMessage.set(this.translate.instant('auth.register.success'));
         this.registerForm.reset();
         },
         error: (error) => {
         this.errorMessage.set(error.message || this.translate.instant('auth.register.error'));
         }
      });
   }
}
