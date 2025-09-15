import { Component, inject, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from "@angular/forms";
import { catchError, finalize, of } from "rxjs";
import { RegisterData } from "../../models";
import { Router } from "@angular/router";
import { AuthService } from "../../../../core/services/auth/auth.service";

@Component({
	selector: 'app-test',
	standalone: true,
	imports: [CommonModule, ReactiveFormsModule],
	templateUrl: './login.html',
})
export class Login {
	isLoading = false;
	errorMessage: string | null = null;
	successMessage: string | null = null;

	private fb = inject(FormBuilder);
	private authService = inject(AuthService);
	private router = inject(Router);

	showPassword = false;
	showConfirmPassword = false;

	signupForm: FormGroup = this.fb.group(
		{
			email: ["", [Validators.required, Validators.email, Validators.maxLength(255)]],
			phone: ["", [Validators.required, Validators.pattern(/^\+?[1-9]\d{1,14}$/)]],
			username: [
				"",
				[Validators.required, Validators.minLength(3), Validators.maxLength(20), Validators.pattern(/^[a-zA-Z0-9]+$/)],
			],
			fullName: ["", [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
			province: ["", Validators.required],
			city: ["", Validators.required],
			password: ["", [Validators.required, Validators.minLength(8), Validators.maxLength(72)]],
			confirmPassword: ["", Validators.required],
		}, {
			validators: [this.passwordMatchValidator],
		}
  	);

	togglePasswordVisibility(): void {
		this.showPassword = !this.showPassword;
	}

	toggleConfirmPasswordVisibility(): void {
		this.showConfirmPassword = !this.showConfirmPassword;
	}

	private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
		const password = control.get('password')?.value;
		const confirmPassword = control.get('confirmPassword')?.value;

		return password && confirmPassword && password !== confirmPassword
			? { passwordMismatch: true }
			: null;
	}

	onSubmit() {
		if (this.signupForm.valid && !this.isLoading) {
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
				.register(payload)
				.pipe(
					catchError((error) => {
						console.error("Registration error:", error);
						this.errorMessage = error.error?.message || "خطا در ثبت نام. لطفاً مجدداً تلاش کنید.";
						return of(null);
					}),
					finalize(() => {
						this.isLoading = false;
					})
				)
				.subscribe((response: any) => {
					if (response) {
						this.successMessage = "ثبت نام با موفقیت انجام شد. در حال انتقال به صفحه ورود...";
						setTimeout(() => {
							this.router.navigate(["/login"]);
						}, 3000);
					}
				});

		} else {
			this.signupForm.markAllAsTouched();
		}
	}
}