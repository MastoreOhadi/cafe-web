import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NavigationBarComponent } from '../../../../core/components/navigation-bar/navigation-bar';
import { AuthService, PhoneVerificationData, ResendOtpData } from '../../../../core/services/auth/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { ZardButtonComponent } from '@shared/ui/button/button.component';

@Component({
  selector: 'app-otp-verification',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    NavigationBarComponent,
    ZardButtonComponent
  ],
  templateUrl: './otp-verification.component.html',
//   styleUrl: './otp-verification.component.css'
})
export class OtpVerificationComponent {
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private translate = inject(TranslateService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  otpForm: FormGroup = this.fb.group({
    otp: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
  });

  // Signals for UI state
  isSubmitting = signal(false);
  isResending = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  phoneNumber = signal<string>('');

  constructor() {
    // Retrieve phone number from route state
    this.route.queryParams.subscribe(params => {
      const phone = params['phone'];
      if (phone) {
        this.phoneNumber.set(phone);
      } else {
        // Redirect to register if no phone number is provided
        this.router.navigate(['/auth/register']);
      }
    });
  }

  onSubmit(): void {
    if (this.otpForm.invalid) {
      this.otpForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const payload: PhoneVerificationData = {
      phone: this.phoneNumber(),
      otp: this.otpForm.value.otp
    };

    this.authService.verifyPhone(payload).pipe(
      finalize(() => this.isSubmitting.set(false))
    ).subscribe({
      next: (response) => {
        this.successMessage.set(this.translate.instant('auth.otp.success'));
        // Redirect to login or dashboard after successful verification
        this.router.navigate(['/auth/login']);
      },
      error: (error) => {
        let errorMsg = this.translate.instant('auth.otp.error');
        if (error.status === 401) {
          if (error.error?.error?.includes('Invalid OTP')) {
            const match = error.error.error.match(/Attempts left: (\d+)/);
            if (match) {
              const attemptsLeft = match[1];
              errorMsg = this.translate.instant('auth.otp.invalidCode', { attemptsLeft });
            }
          } else if (error.error?.error?.includes('OTP has expired')) {
            errorMsg = this.translate.instant('auth.otp.otpExpired');
          } else if (error.error?.error?.includes('Sign-up session expired')) {
            errorMsg = this.translate.instant('auth.otp.sessionExpired');
          }
        } else if (error.status === 429) {
          if (error.error?.error?.includes('Phone is temporarily blocked')) {
            errorMsg = this.translate.instant('auth.otp.phoneBlocked');
          } else if (error.error?.error?.includes('Maximum OTP attempts exceeded')) {
            errorMsg = this.translate.instant('auth.otp.maxAttempts');
          }
        } else if (error.status === 500) {
          errorMsg = this.translate.instant('auth.otp.error');
        }
        this.errorMessage.set(errorMsg);
      }
    });
  }

  resendOtp(): void {
    this.isResending.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const payload: ResendOtpData = {
      phone: this.phoneNumber()
    };

    this.authService.resendPhoneOtp(payload).pipe(
      finalize(() => this.isResending.set(false))
    ).subscribe({
      next: () => {
        this.successMessage.set(this.translate.instant('auth.otp.resendSuccess'));
      },
      error: (error) => {
        let errorMsg = this.translate.instant('auth.otp.resendError');
        if (error.status === 401 && error.error?.error?.includes('Sign-up session expired')) {
          errorMsg = this.translate.instant('auth.otp.sessionExpired');
        } else if (error.status === 429) {
          if (error.error?.error?.includes('Phone is temporarily blocked')) {
            errorMsg = this.translate.instant('auth.otp.phoneBlocked');
          } else if (error.error?.error?.includes('Please wait before requesting new OTP')) {
            errorMsg = this.translate.instant('auth.otp.cooldown');
          } else if (error.error?.error?.includes('Hourly OTP limit exceeded')) {
            errorMsg = this.translate.instant('auth.otp.hourLimitExceeded');
          } else if (error.error?.error?.includes('Daily OTP limit exceeded')) {
            errorMsg = this.translate.instant('auth.otp.dayLimitExceeded');
          }
        }
        this.errorMessage.set(errorMsg);
      }
    });
  }
}