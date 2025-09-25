import { Routes } from '@angular/router';

export const routes: Routes = [
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
   }, {
      title: "page",
      path: "page",
      loadComponent: () =>
         import("./modules/cafe/pages/cafe-page/cafe-page").then(c => c.CafePage)
   }, {
      title: 'otp',
      path: 'otp-verification',
      // component: OtpVerificationComponent,
      loadComponent: () =>
         import("./modules/auth/pages/otp/otp-verification.component").then(c => c.OtpVerificationComponent)
   }
];
