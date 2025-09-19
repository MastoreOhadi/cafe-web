import { DOCUMENT, Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ApiService } from '../api/api.service';
import { catchError, Observable, of, switchMap, tap } from 'rxjs';

export interface RegisterData {
   name: string;
   phone: string;
   city: string;
   province: string;
   password: string;
}

@Injectable({
   providedIn: 'root',
})
export class AuthService {
   private csrfToken: string | null = null;
   private csrfTokenInitialized: boolean = false;

   constructor(
      private api: ApiService,
      @Inject(DOCUMENT) private document: Document,
      @Inject(PLATFORM_ID) private platformId: any
   ) {}

   private getCookie(name: string): string | null {
      if (!isPlatformBrowser(this.platformId)) {
         return null;
      };

      const nameEQ = name + '=';
      const cookies = this.document.cookie.split(';');

      for (let i = 0; i < cookies.length; i++) {
         let cookie = cookies[i];
         while (cookie.charAt(0) === ' ') {
            cookie = cookie.substring(1, cookie.length);
         }

         if (cookie.indexOf(nameEQ) === 0) {
            return cookie.substring(nameEQ.length, cookie.length);
         }
      };

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

      if (!this.csrfTokenInitialized) {
         this.csrfTokenInitialized = true;

         return this.api.get<{ csrf_token: string }>('auth/csrf-token').pipe(
            tap((res: any) => {
               this.csrfToken = res.csrf_token;
            }),
            switchMap((res: any) => of(res.csrf_token))
         );
      };

      throw new Error('CSRF token not available');
   };

   private withCsrfToken<T>(request: (token: string) => Observable<T>): Observable<T> {
      return this.ensureCsrfToken().pipe(
         switchMap(token => request(token)),
         catchError(error => {
         if (error.status === 403 || error.status === 419) {
            this.csrfToken = null;
            this.csrfTokenInitialized = false;

            return this.ensureCsrfToken().pipe(
               switchMap(token => request(token))
            );
         }

         throw error;
         })
      );
   };

   getCsrfToken(): Observable<{ csrf_token: string }> {
      return this.api.get<{ csrf_token: string }>('auth/csrf-token').pipe(
         tap((res: any) => {
            this.csrfToken = res.csrf_token;
         })
      );
   };

   setTokens(accessToken: string, refreshToken: string): void {
      if (isPlatformBrowser(this.platformId)) {
         localStorage.setItem('access_token', accessToken);
         localStorage.setItem('refresh_token', refreshToken);
      }
   };

   getAccessToken(): string | null {
      return isPlatformBrowser(this.platformId) ? localStorage.getItem('access_token') : null;
   };

   getRefreshToken(): string | null {
      return isPlatformBrowser(this.platformId) ? localStorage.getItem('refresh_token') : null;
   };

   refreshToken(): Observable<any> {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) {
         throw new Error('No refresh token available');
      }

      return this.api.post('auth/refresh', { refresh_token: refreshToken }).pipe(
         tap((response: any) => {
            this.setTokens(response.access_token, response.refresh_token);
         }),
         catchError(error => {
            this.logout();
            throw error;
         })
      );
   };

   getProfile(): Observable<any> {
      return this.withCsrfToken(token => {
         return this.api.get('profile', undefined, {
            'X-Csrf-Token': token,
         }).pipe(
            tap((response: any) => {
               console.log('Profile response:', response);
               return response;
            }),
            catchError(error => {
               console.error('Profile error:', error);
               throw error;
            })
         );
      });
   };


   login(userData: any): Observable<any> {
      return this.withCsrfToken(token => {
         return this.api.post('auth/login', userData, {
            'X-Csrf-Token': token,
         }).pipe(
            tap((response: any) => {
               console.log('Login response:', response);
               this.setTokens(response.access_token, response.refresh_token);
            }),
            catchError(error => {
               console.error('Login error:', error);
               throw error;
            })
         );
      });
   };

   register(userData: RegisterData): Observable<any> {
      return this.withCsrfToken(token => {
         return this.api.post('auth/register', userData, {
            'X-Csrf-Token': token,
         }).pipe(
            tap(response => console.log('Register response:', response)),
            catchError(error => {
               console.error('Register error:', error);
               throw error;
            })
         );
      });
   };

   logout(): Observable<any> {
      return this.withCsrfToken(token => {
         return this.api.post('auth/logout', {}, {
            'X-Csrf-Token': token,
         }).pipe(
            tap(() => {
               if (isPlatformBrowser(this.platformId)) {
                  localStorage.removeItem('access_token');
                  localStorage.removeItem('refresh_token');
               }

               this.document.cookie = 'csrf_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
               this.csrfToken = null;
               this.csrfTokenInitialized = false;
            })
         );
      });
   };
};