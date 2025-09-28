import { Injectable, Inject, PLATFORM_ID, Optional, makeStateKey, TransferState, REQUEST } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CookieService } from 'ngx-cookie-service';

export interface Settings {
  theme: 'light' | 'dark';
  language: string;
}

const SETTINGS_KEY = makeStateKey<Settings>('app-settings');

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
   private readonly COOKIE_NAME = 'app-settings';
   private readonly COOKIE_EXPIRES = 365; // days

   constructor(
      private cookieService: CookieService,
      private transferState: TransferState,
      @Inject(PLATFORM_ID) private platformId: any,
      @Optional() @Inject(REQUEST) private request?: any
   ) {}

   getSettings(): Settings {
      const transferred = this.transferState.get(SETTINGS_KEY, null);
      if (transferred) {
         console.log('🎯 Using transferred settings from TransferState:', transferred);
         return transferred;
      }

      const defaults: Settings = {
         theme: 'light',
         language: 'fa'
      };

      try {
         let cookieValue: string | undefined;

         if (isPlatformBrowser(this.platformId)) {
            cookieValue = this.getBrowserCookie();
         } else {
            cookieValue = this.getServerCookie();
         }

         console.log('🎯 Cookie value found:', !!cookieValue);
         console.log('🎯 Cookie value content:', cookieValue);

         if (cookieValue) {
         const saved = JSON.parse(cookieValue);
         const settings = {
            theme: saved.theme || this.detectSystemTheme(),
            language: saved.language || defaults.language
         };

         if (!isPlatformBrowser(this.platformId)) {
            console.log('🎯 Storing settings in TransferState for client:', settings);
            this.transferState.set(SETTINGS_KEY, settings);
         }

         console.log('🎯 Final settings:', settings);
            return settings;
         }

         const settings = {
            theme: this.detectSystemTheme(),
            language: defaults.language
         };

         if (!isPlatformBrowser(this.platformId)) {
            console.log('🎯 Storing default settings in TransferState:', settings);
            this.transferState.set(SETTINGS_KEY, settings);
         }

         console.log('🎯 Using default settings:', settings);
         return settings;

      } catch (error) {
         console.error('❌ Error loading settings:', error);
         const fallbackSettings = {
            theme: this.detectSystemTheme(),
            language: defaults.language
         };

         if (!isPlatformBrowser(this.platformId)) {
            this.transferState.set(SETTINGS_KEY, fallbackSettings);
         }

         return fallbackSettings;
      }
   }

   private getBrowserCookie(): string | undefined {
      try {
         const rawValue = this.cookieService.get(this.COOKIE_NAME);
         console.log('🎯 Browser cookie raw:', rawValue);
         return rawValue ? decodeURIComponent(rawValue) : undefined;
      } catch (error) {
         console.error('❌ Error reading browser cookie:', error);
         return undefined;
      }
   }

   private getServerCookie(): string | undefined {
      console.log('🎯 Attempting to read server cookie...');

      // اول از context بخون
      if (this.request?.context?.appSettings) {
         const contextSettings = this.request.context.appSettings;
         console.log('🎯 Found settings in context:', contextSettings);

         // از context مستقیماً استفاده کن و کوکی رو شبیه‌سازی کن
         const simulatedCookie = JSON.stringify({
            theme: contextSettings.theme,
            language: contextSettings.language
         });
         console.log('🎯 Using simulated cookie from context:', simulatedCookie);
         return simulatedCookie;
      }

      // اگر context نبود، از کوکی‌های مستقیم استفاده کن
      console.log('🎯 REQUEST object:', this.request);
      console.log('🎯 REQUEST cookies:', this.request?.cookies);

      if (this.request?.cookies && this.COOKIE_NAME in this.request.cookies) {
         const rawValue = this.request.cookies[this.COOKIE_NAME];
         console.log('🎯 Raw cookie value from REQUEST:', rawValue);
         try {
            return decodeURIComponent(rawValue);
         } catch (error) {
            console.log('🎯 Cookie already decoded or error decoding:', error);
            return rawValue;
         }
      }

      console.log('🎯 No cookie found on server');
      return undefined;
   }

   saveSettings(settings: Settings): void {
      console.log('🎯 Saving settings:', settings);

      if (isPlatformBrowser(this.platformId)) {
         try {
            const json = JSON.stringify(settings);
            this.cookieService.set(
               this.COOKIE_NAME,
               json, // Avoid encodeURIComponent to keep it simple
               this.COOKIE_EXPIRES,
               '/',
               undefined,
               true, // Set secure to true for HTTPS
               'Lax'
            );
            console.log('🎯 Settings saved to cookie successfully');
         } catch (error) {
            console.error('❌ Error saving settings to cookie:', error);
         }
      } else {
         console.log('🎯 saveSettings() called on server - ignoring');
      }
   }

   private detectSystemTheme(): 'light' | 'dark' {
      if (isPlatformBrowser(this.platformId) && window.matchMedia) {
         const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
         console.log('🎯 System theme detected:', isDark ? 'dark' : 'light');
         return isDark ? 'dark' : 'light';
      }
      return 'light'; // Default for server
   }
}
