import { Component, inject, computed } from '@angular/core';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { selectTheme } from '../../../store/settings/settings.selectors';
import * as settingsActions from '../../../store/settings/settings.actions';

@Component({
  selector: 'app-theme-switcher',
  standalone: true,
  template: `
    <button
      class="flex items-center gap-2 px-4 py-2 rounded-full border transition-colors duration-300
             hover:bg-gray-200 dark:hover:bg-gray-700"
      (click)="toggleTheme()"
      [attr.aria-label]="ariaLabel()"
      [title]="ariaLabel()"
    >
      <div class="relative w-6 h-6">
        @if (theme() === 'light') {
          <svg class="w-6 h-6 text-yellow-400 absolute inset-0 transition-opacity duration-300"
               fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
          </svg>
        } @else {
          <svg class="w-6 h-6 text-indigo-500 absolute inset-0 transition-opacity duration-300"
             fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
          </svg>
        }
      </div>

      <!-- <span class="text-sm font-medium text-gray-700 dark:text-gray-200">
        {{ theme() === 'dark' ? 'Light Mode' : 'Dark Mode' }}
      </span> -->
    </button>
  `,
  styles: [`
    /* Smooth icon crossfade */
    svg {
      transition: opacity 0.3s ease-in-out, transform 0.3s ease-in-out;
    }
  `]
})
export class ThemeSwitcherComponent {
  private store = inject(Store);

  // Signal از store
  theme = toSignal(this.store.select(selectTheme), { initialValue: 'light' });

  ariaLabel = computed(() =>
    this.theme() === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
  );

  toggleTheme(): void {
    this.store.dispatch(settingsActions.toggleTheme());
  }
}
