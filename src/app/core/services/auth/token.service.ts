import { Injectable, Inject, PLATFORM_ID, DOCUMENT } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, of, switchMap, tap } from 'rxjs';
import { ApiService } from '../api/api.service';

@Injectable({
   providedIn: 'root',
})
export class TokenService {
   // private access_token: string | null = null;
   private csrfToken: string | null = null;

   constructor(
      private api: ApiService,
      @Inject(PLATFORM_ID) private platformId: any,
      @Inject(DOCUMENT) private document: Document,
   ) {}

   private getCookie(name: string): string | null {
      if (!isPlatformBrowser(this.platformId)) return null;

      const nameEQ = name + '=';
      const cookies = this.document.cookie.split(';');
      for (let c of cookies) {
         c = c.trim();
         if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length);
      }
      return null;
   };

   ensureCsrfToken(): Observable<string> {
      if (this.csrfToken) {
         return of(this.csrfToken);
      }

      const cookieToken = this.getCookie('csrf_token');
      if (cookieToken) {
         this.csrfToken = cookieToken;
         return of(cookieToken);
      }

      if (!this.csrfToken) {
         return this.api.get<{ csrf_token: string }>('auth/csrf-token').pipe(
            tap((res: any) => {
               this.csrfToken = res.csrf_token;
            }),
            switchMap(
               (res: any) => of(res.csrf_token)
            )
         );
      };

      throw new Error('CSRF token not available');
   };

   reset(): void {
      this.csrfToken = null;
      this.document.cookie = 'csrf_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
   }

   setTokens(accessToken: string, refreshToken: string): void {
      // this.access_token = accessToken;
      if (isPlatformBrowser(this.platformId)) {
         sessionStorage.setItem("access_token", accessToken);
         localStorage.setItem('refresh_token', refreshToken);
      }
   }

   getAccessToken(): string | null {
      return isPlatformBrowser(this.platformId) ? sessionStorage.getItem("access_token") : null;
   }

   getRefreshToken(): string | null {
      return isPlatformBrowser(this.platformId)
         ? localStorage.getItem('refresh_token')
         : null;
   }

   clear(): void {
      if (isPlatformBrowser(this.platformId)) {
         sessionStorage.removeItem("access_token");
         localStorage.removeItem('refresh_token');
      };
   };
};
