import { Injectable } from '@angular/core';
import { ApiService } from '../api/api.service';
import { catchError, map, Observable, of, switchMap, tap } from 'rxjs';
import { TokenService } from './token.service';

export interface RegisterData {
   full_name: string;
   phone: string;
   city: string;
   province: string;
   password: string;
   recaptchaToken: string;
}

export interface LoginData {
   entity: string;
   password: string;
   rememberMe: boolean;
   recaptchaToken: string;
}

export interface PhoneVerificationData {
   phone: string;
   otp: string;
}

export interface ResendOtpData {
   phone: string;
}

@Injectable({
   providedIn: 'root',
})
export class AuthService {
   constructor(
      private api: ApiService,
      private tokenService: TokenService,
   ) {}

   private withCsrfToken<T>(
      request: (token: string) => Observable<T>
   ): Observable<T> {
      return this.tokenService.ensureCsrfToken().pipe(
         switchMap((token) => request(token)),
         catchError((error) => {
            if (error.status === 403 || error.status === 419) {
               this.tokenService.reset();
               return this.tokenService.ensureCsrfToken().pipe(
                  switchMap((token) => request(token))
               );
            }

            throw error;
         })
      );
   };

   autoLogin(): Observable<string | null> {
      const access = this.tokenService.getAccessToken();
      if (access) {
         return of(access);
      }

      const refreshToken = this.tokenService.getRefreshToken();
      if (refreshToken) {
         return this.refreshToken().pipe(
            map((res: any) => {
               const token = res?.access_token || null;
               return token;
            }),
            catchError(() => {
               this.tokenService.clear();
               return of(null);
            })
         );
      }

      return of(null);
   }

   refreshToken(): Observable<any> {
      const refreshToken = this.tokenService.getRefreshToken();
      if (!refreshToken) throw new Error('No refresh token available');

      return this.withCsrfToken((token) => this.api.post(
            'auth/refresh', { refresh_token: refreshToken }, {'X-Csrf-Token': token}
         ).pipe(
            tap((response: any) => {
               console.log(response)
               this.tokenService.setTokens(
                  response.access_token,
                  response.refresh_token || refreshToken
               );
            }),
            catchError((error) => {
               this.logout();
               throw error;
            })
         )
      );
   };

   login(userData: LoginData): Observable<any> {
      return this.withCsrfToken((token) =>
         this.api.post('auth/login', userData, {
            'X-Csrf-Token': token,
         }).pipe(
            tap((response: any) => {
               this.tokenService.setTokens(
                  response.access_token,
                  response.refresh_token
               );
            })
         )
      );
   };

   register(userData: RegisterData): Observable<any> {
      return this.withCsrfToken((token) =>
         this.api.post('auth/register', userData, {
            'X-Csrf-Token': token,
         })
      );
   };

   verifyPhone(data: PhoneVerificationData): Observable<any> {
      return this.withCsrfToken((token) =>
         this.api.post('auth/verify-phone', data, {
            'X-Csrf-Token': token,
         }).pipe(
            tap((response: any) => {
               this.tokenService.setTokens(
                  response.access_token,
                  response.refresh_token
               );
            })
         )
      );
   };

   resendPhoneOtp(data: ResendOtpData): Observable<any> {
      return this.withCsrfToken((token) =>
         this.api.post('auth/resend-otp', data, {
         'X-Csrf-Token': token,
         })
      );
   };

   getProfile(): Observable<any> {
      return this.withCsrfToken((token) =>
         this.api.get('profile', undefined, {
         'X-Csrf-Token': token,
         })
      );
   };

   logout(): Observable<any> {
      return this.withCsrfToken((token) =>
         this.api.post(
            'auth/logout', {}, { 'X-Csrf-Token': token }
         ).pipe(
            tap(() => {
               this.tokenService.clear();
               this.tokenService.reset();
            })
         )
      );
   };
};
