import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { selectLanguage } from '../../../store/settings/settings.selectors';
import { AppTranslateService } from '../../services/translate/translate.service';

@Component({
   selector: 'app-language-switcher',
   standalone: true,
   imports: [CommonModule],
   template: `
      <div class="language-switcher">
         <button
         class="lang-btn"
         (click)="switchToPersian()"
         [class.active]="(currentLanguage$ | async) === 'fa'"
         title="Switch to Persian">
         <span class="flag">🇮🇷</span>
         <span class="lang-text">فارسی</span>
         </button>

         <button
         class="lang-btn"
         (click)="switchToEnglish()"
         [class.active]="(currentLanguage$ | async) === 'en'"
         title="Switch to English">
         <span class="flag">🇺🇸</span>
         <span class="lang-text">English</span>
         </button>

         <button
         class="lang-btn"
         (click)="switchToArabic()"
         [class.active]="(currentLanguage$ | async) === 'ar'"
         title="Switch to Arabic">
         <span class="flag">🇸🇦</span>
         <span class="lang-text">العربية</span>
         </button>
      </div>
   `,
})
export class LanguageSwitcherComponent {
   private store = inject(Store);
   private appTranslateService = inject(AppTranslateService);

   currentLanguage$: Observable<string>;

   constructor() {
      this.currentLanguage$ = this.store.select(selectLanguage);
   }

   switchToEnglish(): void {
      this.appTranslateService.switchLanguage('en');
   }

   switchToPersian(): void {
      this.appTranslateService.switchLanguage('fa');
   }

   switchToArabic(): void {
      this.appTranslateService.switchLanguage('ar');
   }
}
