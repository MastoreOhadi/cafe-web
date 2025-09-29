import { Injectable, Inject, PLATFORM_ID, makeStateKey, TransferState } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { SsrCookieService } from 'ngx-cookie-service-ssr';


export interface Settings {
  theme: 'light' | 'dark';
  language: string;
}

const SETTINGS_KEY = makeStateKey<Settings>('settings');

@Injectable({
   providedIn: 'root'
})
export class SettingsService {
   private readonly COOKIE_NAME = 'settings';

   constructor(
      private readonly cookieService: SsrCookieService,
      private readonly transferState: TransferState,
      @Inject(PLATFORM_ID) private readonly platformId: any,
   ) {}

   getSettings(): Settings {
      const transferred = this.transferState.get(SETTINGS_KEY, null);
      if (transferred) return transferred;

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

         if (cookieValue) {
            const saved = JSON.parse(cookieValue);
            const settings = {
               theme: saved.theme || this.detectSystemTheme(),
               language: saved.language || defaults.language
            };

            if (!isPlatformBrowser(this.platformId)) {
               this.transferState.set(SETTINGS_KEY, settings);
            }

            return settings;
         }

         const settings = {
            theme: this.detectSystemTheme(),
            language: defaults.language
         };

         if (!isPlatformBrowser(this.platformId)) {
            this.transferState.set(SETTINGS_KEY, settings);
         }

         return settings;

      } catch (error) {
         console.log("ffff", error)
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
         return this.cookieService.get(this.COOKIE_NAME) || undefined;
      } catch (error) {
         return undefined;
      }
   }

   private getServerCookie(): string | undefined {
      try {
         return this.cookieService.get(this.COOKIE_NAME) || undefined;
      } catch (error) {
         return undefined;
      }
   }

   saveSettings(settings: Settings): void {
      try {
         const json = JSON.stringify(settings);

         this.cookieService.set(
            this.COOKIE_NAME,
            json,
            {
               expires: 365,
               path: '/',
               secure: true, // secure
               sameSite: 'Lax'
            }
         );
      } catch (error) {
         console.error('❌ Error saving settings to cookie:', error);
      }
   }

   private detectSystemTheme(): 'light' | 'dark' {
      if (isPlatformBrowser(this.platformId) && window.matchMedia) {
         return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }

      return 'light'; // Default for server
   }
}