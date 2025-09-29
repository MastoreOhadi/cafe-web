
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
   {
      path: '', // مسیر اصلی
      pathMatch: 'full',
      redirectTo: 'auth/login'
   },
   {
      path: 'page',
      title: 'page',
      loadComponent: () =>
         import('./modules/cafe/pages/cafe-page/cafe-page').then(c => c.CafePage),
      canMatch: [authGuard]
   },
   {
      path: 'auth',
      children: [
         {
            path: 'signup',
            title: 'signup',
            loadComponent: () =>
               import('./modules/auth/pages/register/register').then(c => c.Register)
         },
         {
            path: 'login',
            title: 'login',
            loadComponent: () =>
               import('./modules/auth/pages/login/login').then(c => c.Login)
         },
         {
            path: '', // مسیر خالی auth
            pathMatch: 'full',
            redirectTo: 'login'
         }
      ]
   },

   {
      path: '**',
      redirectTo: 'auth/login'
   }
];
