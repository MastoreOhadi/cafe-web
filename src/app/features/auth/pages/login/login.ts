import { Component, inject, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from "@angular/forms";
import { catchError, finalize, of } from "rxjs";
import { RegisterData } from "../../models";
import { Router } from "@angular/router";
import { AuthService } from "../../../../core/services/auth/auth.service";
import { LanguageSwitcherComponent } from "../../../../core/components/language-switcher/language-switcher";

@Component({
	selector: 'app-test',
	standalone: true,
	imports: [CommonModule, ReactiveFormsModule, LanguageSwitcherComponent],
	templateUrl: './login.html',
})
export class Login {
	isLoading = false;
	errorMessage: string | null = null;
	successMessage: string | null = null;
	isSubmitting = false;

	private fb = inject(FormBuilder);
	private authService = inject(AuthService);
	private router = inject(Router);

	showPassword = false;
	showConfirmPassword = false;

	signupForm: FormGroup = this.fb.group(
		{
			phone: ["", [Validators.required, Validators.pattern(/^\+?[1-9]\d{1,14}$/)]],
			password: ["", [Validators.required, Validators.minLength(8), Validators.maxLength(72)]],
		}
  	);

	togglePassword() {
		this.showPassword = !this.showPassword;
	}

	onSubmit() {
		if (this.signupForm.valid) {
			this.isSubmitting = true;
			this.isLoading = true;
			this.errorMessage = null;
			this.successMessage = null;

			const formData = { ...this.signupForm.value };
			delete formData.confirmPassword;

			const payload: RegisterData = {
				email: formData.email,
				phone: formData.phone,
				username: formData.username,
				password: formData.password,
				full_name: formData.fullName,
				province: formData.province,
				city: formData.city,
			};

			this.authService
				.login(payload)
				.pipe(
					catchError((error) => {
						console.error("Registration error:", error);
						this.errorMessage = error.error?.message || "خطا در ثبت نام. لطفاً مجدداً تلاش کنید.";
						return of(null);
					}),
					finalize(() => {
						this.isLoading = false;
						this.isSubmitting = false;
					})
				)
				.subscribe((response: any) => {
					if (response) {
						this.successMessage = "ثبت نام با موفقیت انجام شد. در حال انتقال به صفحه ورود...";
						setTimeout(() => {
							this.router.navigate(["/signup"]);
						}, 3000);
					}
				});

		} else {
			Object.keys(this.signupForm.controls).forEach(key => {
				this.signupForm.get(key)?.markAsTouched();
			});
		}
	}
}