import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { finalize, firstValueFrom } from 'rxjs';

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
   changeDetection: ChangeDetectionStrategy.OnPush,
   templateUrl: './login.html',
   styleUrl: './login.css'
})
export class Login {
   private authService = inject(AuthService);
   private fb = inject(FormBuilder);
   private router = inject(Router);
   private translate = inject(TranslateService);

   showPassword = signal(false);
   isSubmitting = signal(false);
   errorMessage = signal<string | null>(null);

   loginForm: FormGroup = this.fb.nonNullable.group({
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
         this.errorMessage.set(
         error?.message || this.translate.instant('auth.login.error')
         );
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