import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TokenService } from '../services/auth/token.service';

export const authGuard: CanActivateFn = async () => {
    if (inject(TokenService).getAccessToken()) {
        return true;
    } else {
        inject(Router).navigate(['/login']);
        return false;
    }

   return false
}