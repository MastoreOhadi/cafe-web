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
   styles: [`
      .language-switcher {
         @apply flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg;
         @apply border border-gray-200 dark:border-gray-700;
      }

      .lang-btn {
         @apply flex items-center gap-2 px-3 py-2 rounded-md;
         @apply text-sm font-medium transition-all duration-200;
         @apply focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2;
         @apply hover:bg-gray-200 dark:hover:bg-gray-700;

         &:not(.active) {
         @apply text-gray-600 dark:text-gray-400;
         }

         &.active {
         @apply bg-white dark:bg-gray-700 text-gray-900 dark:text-white;
         @apply shadow-sm border border-gray-200 dark:border-gray-600;
         }
      }

      .flag {
         @apply text-lg;
      }

      .lang-text {
         @apply font-medium;
      }

      /* RTL Support */
      [dir="rtl"] .language-switcher {
         @apply flex-row-reverse;
      }

      [dir="rtl"] .lang-btn {
         @apply flex-row-reverse;
      }
   `]
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
