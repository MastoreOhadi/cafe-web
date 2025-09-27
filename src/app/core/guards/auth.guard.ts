import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../services/auth/auth.service';

export const authGuard: CanMatchFn = async () => {
   const authService = inject(AuthService);
   const router = inject(Router);

   return firstValueFrom(
      authService.autoLogin()
   ).then(token => {
      if (token) return true;
      else {
         router.navigate(['/auth/login']);
         return false;
      }
   }).catch(() => {
      router.navigate(['/auth/login']);
      return false;
   });
};
