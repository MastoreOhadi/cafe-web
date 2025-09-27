import { inject, PLATFORM_ID } from '@angular/core';
import { CanMatchFn, Route, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { catchError, firstValueFrom, of } from 'rxjs';
import { isPlatformServer } from '@angular/common';

export const authGuard: CanMatchFn = async () => {
   const authService = inject(AuthService);
   const router = inject(Router);
   const platformId = inject(PLATFORM_ID);

   if (isPlatformServer(platformId)) return true;

   const token = await firstValueFrom(
      authService.autoLogin().pipe(catchError(() => of(null)))
   );

   if (token) {
      return true;
   } else {
      router.navigate(['/auth/login'], { queryParams: { returnUrl: router.url } });
      return false;
   };
};