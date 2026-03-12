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
        loadChildren: () =>
          import('./features/pets/pets.routes')
            .then(m => m.PETS_ROUTES)
      },
      {
        path: 'about',
        loadChildren: () =>
          import('./features/about/about.routes')
            .then(m => m.ABOUT_ROUTES)
      }
    ]
  },



  {
    path: 'register',
    component: AuthLayoutComponent,
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./features/register/register.routes')
            .then(m => m.REGISTER_ROUTES)
      },

    ]
  },

  {
    path: 'login',
    component: AuthLayoutComponent,
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./features/login/login.routes')
            .then(m => m.LOGIN_ROUTES)
      },

    ]
  }
];
