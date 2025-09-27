import { inject } from '@angular/core';
import { AuthService } from '../services/auth/auth.service';
import { HttpInterceptorFn } from '@angular/common/http';
import { from, switchMap } from 'rxjs';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
   const authService = inject(AuthService);
   if (req.url.includes('/api/') && !req.url.includes('/auth/')) {
      return from(authService.autoLogin()).pipe(
         switchMap(newToken => {
            if (newToken) {
               req = req.clone({
                  setHeaders: {Authorization: `Bearer ${newToken}`}
               });
            }
            return next(req);
         })
      );
   };

   return next(req);
};