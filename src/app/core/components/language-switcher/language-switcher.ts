import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { selectLanguage } from '../../../store/settings/settings.selectors';
import { AppTranslateService } from '../../services/translate/translate.service';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative inline-block text-left">
      <!-- دکمه اصلی -->
      <button
        (click)="toggleDropdown()"
        class="inline-flex justify-between items-center w-32 px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        [attr.aria-expanded]="open()"
        aria-haspopup="true"
      >
        <span class="flex items-center gap-2">
          <span class="text-lg">{{ selectedLanguage().flag }}</span>
          <span>{{ selectedLanguage().name }}</span>
        </span>
        <svg class="w-4 h-4 ml-2 transition-transform duration-200"
             [class.rotate-180]="open()"
             xmlns="http://www.w3.org/2000/svg"
             fill="none" viewBox="0 0 24 24"
             stroke="currentColor">
          <path stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <!-- لیست کشویی -->
      @if (open()) {
        <div
          class="absolute z-10 mt-2 w-32 bg-white border border-gray-200 rounded-lg shadow-lg"
          role="menu"
          aria-orientation="vertical"
        >
          <ul class="py-1">
            @for (lang of languages; track lang.code) {
              <li
                (click)="switchLanguage(lang.code)"
                class="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 transition-colors duration-150"
                [class.bg-blue-50]="currentLanguage() === lang.code"
                role="menuitem"
              >
                <span class="text-lg">{{ lang.flag }}</span>
                <span>{{ lang.name }}</span>
              </li>
            }
          </ul>
        </div>
      }
    </div>
  `
})
export class LanguageSwitcherComponent {
  private store = inject(Store);
  private appTranslateService = inject(AppTranslateService);

  open = signal(false);

  languages = [
    { code: 'fa', name: 'فارسی', flag: '🇮🇷' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  ];

  // استفاده از toSignal برای تبدیل observable به signal
  currentLanguage = toSignal(this.store.select(selectLanguage), {
    initialValue: 'fa'
  });

  // محاسبه زبان انتخاب شده بر اساس currentLanguage
  selectedLanguage = computed(() => {
    const code = this.currentLanguage();
    const found = this.languages.find(l => l.code === code);
    return found || this.languages[0];
  });

  toggleDropdown() {
    this.open.update(open => !open);
  }

  switchLanguage(code: string): void {
    this.appTranslateService.switchLanguage(code);
    this.open.set(false);
  }
}