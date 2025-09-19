import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class CustomValidators {
  /**
   * Validator to check if password meets strength requirements
   */
  static passwordStrength(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }

    const password = control.value;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
      return { passwordStrength: true };
    }

    return null;
  }

  /**
   * Validator to check if two form controls have matching values
   */
  static match(controlName: string, matchingControlName: string): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      const control = formGroup.get(controlName);
      const matchingControl = formGroup.get(matchingControlName);

      if (!control || !matchingControl) {
        return null;
      }

      if (matchingControl.errors && !matchingControl.errors['mismatch']) {
        return null;
      }

      if (control.value !== matchingControl.value) {
        matchingControl.setErrors({ mismatch: true });
        return { mismatch: true };
      } else {
        matchingControl.setErrors(null);
        return null;
      }
    };
  }

  /**
   * Validator for Iranian phone numbers
   */
  static iranianPhone(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }

    const phoneRegex = /^09[0-9]{9}$/;
    if (!phoneRegex.test(control.value)) {
      return { iranianPhone: true };
    }

    return null;
  }

  /**
   * Validator for Persian text (only Persian characters, spaces, and common punctuation)
   */
  static persianText(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }

    const persianRegex = /^[\u0600-\u06FF\s\u200C\u200D\u06F0-\u06F9]+$/;
    if (!persianRegex.test(control.value)) {
      return { persianText: true };
    }

    return null;
  }
}