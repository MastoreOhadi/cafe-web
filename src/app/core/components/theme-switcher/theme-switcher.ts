import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { selectTheme } from '../../../store/settings/settings.selectors';
import * as settingsActions from '../../../store/settings/settings.actions';

@Component({
  selector: 'app-theme-switcher',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="theme-switcher">
      <button
        class="theme-btn"
        (click)="toggleTheme()"
        [attr.aria-label]="(currentTheme$ | async) === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
        title="{{ (currentTheme$ | async) === 'dark' ? 'Switch to light mode' : 'Switch to dark mode' }}">

        <!-- Sun icon for light mode -->
        <svg
          *ngIf="(currentTheme$ | async) === 'light'"
          class="theme-icon sun-icon"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z">
          </path>
        </svg>

        <!-- Moon icon for dark mode -->
        <svg
          *ngIf="(currentTheme$ | async) === 'dark'"
          class="theme-icon moon-icon"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z">
          </path>
        </svg>

        <span class="theme-text">
          {{ (currentTheme$ | async) === 'dark' ? 'Light' : 'Dark' }}
        </span>
      </button>
    </div>
  `,
})
export class ThemeSwitcherComponent {
  private store = inject(Store);

  currentTheme$: Observable<string>;

  constructor() {
    this.currentTheme$ = this.store.select(selectTheme);
  }

  toggleTheme(): void {
    // Simple approach: just dispatch toggle action
    this.store.dispatch(settingsActions.toggleTheme());
  }
}