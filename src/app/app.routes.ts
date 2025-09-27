import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
   {
      title: "page",
      path: "page",
      loadComponent: () =>
         import("./modules/cafe/pages/cafe-page/cafe-page").then(c => c.CafePage),
      canMatch: [authGuard]
   }, {
      title: "auth",
      path: "auth",
      children: [
         {
            title: "signup",
            path: "signup",
            loadComponent: () =>
               import("./modules/auth/pages/register/register").then(c => c.Register)
         }, {
            title: "login",
            path: "login",
            loadComponent: () =>
               import("./modules/auth/pages/login/login").then(c => c.Login)
         }
      ]
   }
];
