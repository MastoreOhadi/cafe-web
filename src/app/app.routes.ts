import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        title: "signup",
        path: "signup",
        loadComponent: () =>
            import("../app/features/auth/pages/register/register").then(c => c.Register)
    }, {
        title: "login",
        path: "login",
        loadComponent: () =>
            import("../app/features/auth/pages/login/login").then(c => c.Login)
    }, {
        title: "page",
        path: "page",
        loadComponent: () =>
            import("../app/features/cafe/pages/cafe-page/cafe-page").then(c => c.CafePage)
    }
];
