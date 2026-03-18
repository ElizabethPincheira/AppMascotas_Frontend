import { Routes } from '@angular/router';
import { MainLayoutComponent } from './core/layout/main-layout/main-layout/main-layout.component';
import { AuthLayoutComponent } from './core/layout/auth-layout/auth-layout/auth-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/pet/pets/pets-page.component')
            .then(m => m.PetsPageComponent)
      },
      {
        path: 'about',
        loadComponent: () =>
          import('./pages/pet/about/about-page.component')
            .then(m => m.AboutPageComponent)
      }
    ]
  },
  {
    path: 'register',
    component: AuthLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/general/register/register-page.component')
            .then(m => m.RegisterPageComponent)
      },
    ],
  },
  {
    path: 'login',
    component: AuthLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/general/login/login-page.component')
            .then(m => m.LoginPageComponent)
      },
    ],
  },
];
