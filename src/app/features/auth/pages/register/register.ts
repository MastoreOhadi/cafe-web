import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { selectLanguage, selectTheme } from '../../../../store/settings/settings.selectors';
import { ThemeSwitcherComponent } from '../../../../core/components/theme-switcher/theme-switcher';
import { LanguageSwitcherComponent } from '../../../../core/components/language-switcher/language-switcher';

@Component({
  selector: 'app-register',
  imports: [CommonModule, FormsModule, TranslateModule, ThemeSwitcherComponent, LanguageSwitcherComponent],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class Register {
  private store = inject(Store);

  // Observable properties
  currentLanguage$: Observable<string>;
  currentTheme$: Observable<string>;

  // Form data
  formData = {
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  };

  constructor() {
    this.currentLanguage$ = this.store.select(selectLanguage);
    this.currentTheme$ = this.store.select(selectTheme);
  }


  // Form submission
  onSubmit(): void {
    console.log('Form submitted:', this.formData);
  }
}
