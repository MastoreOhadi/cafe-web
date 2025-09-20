import { Component } from '@angular/core';
import { ThemeSwitcherComponent } from '../theme-switcher/theme-switcher';
import { LanguageSwitcherComponent } from '../language-switcher/language-switcher';

@Component({
  selector: 'app-navigation-bar',
  standalone: true,
  imports: [ThemeSwitcherComponent, LanguageSwitcherComponent],
  template: `
    <!-- Navigation Bar -->
    <nav class="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo Section -->
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
              <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <div class="flex flex-col">
              <span class="text-xl font-bold text-gray-900">کافه</span>
              <span class="text-xs text-gray-500 -mt-1">Cafe</span>
            </div>
          </div>

          <!-- Theme & Language Switchers -->
          <div class="flex items-center gap-3">
            <app-theme-switcher></app-theme-switcher>
            <app-language-switcher></app-language-switcher>
          </div>
        </div>
      </div>
    </nav>
  `,
  styles: []
})
export class NavigationBarComponent {
  constructor() {}
}
