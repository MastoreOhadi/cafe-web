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
  styles: [`
    .theme-switcher {
      @apply inline-block;
    }
    
    .theme-btn {
      @apply flex items-center gap-2 px-3 py-2 rounded-lg;
      @apply bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300;
      @apply border border-gray-200 dark:border-gray-700;
      @apply hover:bg-gray-200 dark:hover:bg-gray-700;
      @apply focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2;
      @apply transition-all duration-200 ease-in-out;
      @apply shadow-sm hover:shadow-md;
    }
    
    .theme-icon {
      @apply w-5 h-5 transition-all duration-200;
    }
    
    .sun-icon {
      @apply text-yellow-500;
    }
    
    .moon-icon {
      @apply text-blue-400;
    }
    
    .theme-text {
      @apply text-sm font-medium;
    }
    
    /* Animation for icon rotation */
    .theme-btn:hover .theme-icon {
      @apply transform rotate-12 scale-110;
    }
    
    /* RTL Support */
    [dir="rtl"] .theme-btn {
      @apply flex-row-reverse;
    }
  `]
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