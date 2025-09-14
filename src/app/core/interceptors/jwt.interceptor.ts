import { inject } from '@angular/core';
import { AuthService } from '../services/auth/auth.service';
import { HttpInterceptorFn } from '@angular/common/http';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
   if (req.url.includes('/api/') && !req.url.includes('/auth/')) {
      const token = inject(AuthService).getAccessToken();
      if (token) {
         req = req.clone({
            setHeaders: {Authorization: `Bearer ${token}`}
         });
      }
   }

   return next(req);
};