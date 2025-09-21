import { Component, inject, computed } from '@angular/core';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { selectTheme } from '../../../store/settings/settings.selectors';
import * as settingsActions from '../../../store/settings/settings.actions';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-theme-switcher',
  standalone: true,
  imports: [NgClass],
  template: `
    <button
      class="relative flex items-center w-16 h-8 p-1 rounded-full bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 transition-all duration-300 ease-in-out
             hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      (click)="toggleTheme()"
    >
      <div class="relative w-6 h-6 transform transition-transform duration-300 ease-in-out"
           [ngClass]="{
             'translate-x-8 rtl:-translate-x-8': theme() === 'dark',
             'translate-x-0 rtl:translate-x-0': theme() === 'light'
           }">
        @if (theme() === 'light') {
          <svg class="w-6 h-6 text-yellow-400 animate-sun" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 4.5v-1m0 17v-1m7.5-7.5h1m-17 0h-1m14.35 4.95l.7-.7m-12.7 0l-.7-.7m12.7-7.9l-.7.7m-12.7 0l.7-.7M12 16a4 4 0 100-8 4 4 0 000 8z"/>
          </svg>
        } @else {
          <svg class="w-6 h-6 text-indigo-400 animate-moon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z"/>
          </svg>
        }
      </div>
    </button>
  `,
  styles: [`
    :host {
      display: inline-block;
    }
    button {
      transition: background-color 0.3s ease-in-out, border-color 0.3s ease-in-out;
    }
    svg {
      transition: opacity 0.3s ease-in-out, transform 0.3s ease-in-out;
    }
    .animate-sun {
      animation: rotate 0.5s ease-in-out;
    }
    .animate-moon {
      animation: rotate 0.5s ease-in-out reverse;
    }
    @keyframes rotate {
      0% {
        transform: rotate(0deg) scale(0.8);
        opacity: 0.5;
      }
      100% {
        transform: rotate(360deg) scale(1);
        opacity: 1;
      }
    }
  `]
})
export class ThemeSwitcherComponent {
  private store = inject(Store);

  theme = toSignal(this.store.select(selectTheme), { initialValue: 'light' });

  toggleTheme(): void {
    this.store.dispatch(settingsActions.toggleTheme());
  }
}