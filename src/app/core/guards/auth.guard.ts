import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { isPlatformBrowser } from '@angular/common';

export const authGuard: CanActivateFn = async () => {
    if (inject(AuthService).getAccessToken()) {
        return true;
    } else {
        inject(Router).navigate(['/login']);
        return false;
    }

   return false
}