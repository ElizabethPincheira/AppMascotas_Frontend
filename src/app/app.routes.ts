import { Routes } from '@angular/router';
import { MainLayoutComponent } from './core/layout/main-layout/main-layout/main-layout.component';
import { AuthLayoutComponent } from './core/layout/auth-layout/auth-layout/auth-layout.component';
import { authGuard } from './core/guards/auth.guard';
import { noAuthGuard } from './core/guards/no-auth.guard';

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
        path: 'perdidos',
        loadComponent: () =>
          import('./pages/pet/lista-mascotas/lista-mascotas.component')
            .then(m => m.ListaMascotasComponent),
        data: { modo: 'perdidos' },
      },
      {
        path: 'adopcion',
        loadComponent: () =>
          import('./pages/pet/lista-mascotas/lista-mascotas.component')
            .then(m => m.ListaMascotasComponent),
        data: { modo: 'adopcion' },
      },
      {
        path: 'about',
        loadComponent: () =>
          import('./pages/pet/about/about-page.component')
            .then(m => m.AboutPageComponent)
      },
      {
        path: 'tiendas',
        loadComponent: () =>
          import('./pages/ecommer/tiendas/tiendas.component')
            .then(m => m.TiendaComponent)
      },
      {
        path: 'tiendas/:id',
        loadComponent: () =>
          import('./pages/ecommer/tienda/tienda.component')
            .then(m => m.StoreDetailComponent)
      },
      {
        path: 'colaboradores',
        loadComponent: () =>
          import('./pages/pet/colaboradores/colaboradores.component')
            .then(m => m.ColaboradoresComponent)
      },
      {
        path: 'fauna',
        loadComponent: () =>
          import('./pages/pet/fauna/fauna.component')
            .then(m => m.FaunaComponent)
      },
      {
        path: 'donar',
        loadComponent: () =>
          import('./pages/pet/donaciones/donaciones.component')
            .then(m => m.DonacionesComponent)
      },
      {
        path: 'publicar',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./pages/pet/publicar/publicar.component')
            .then(m => m.PublicarComponent)
      },
      {
        path: 'publicar/:id',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./pages/pet/publicar/publicar.component')
            .then(m => m.PublicarComponent)
      },
      {
        path: 'mis-mascotas',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./pages/pet/mis-mascotas/mis-mascotas.component')
            .then(m => m.MisMascotasComponent)
      },
      {
        path: 'mi-cuenta',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./pages/general/mi-user/mi-user.component')
            .then(m => m.MiUserComponent)
      }
    ]
  },
  {
    path: 'register',
    component: AuthLayoutComponent,
    canActivate: [noAuthGuard],
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
    canActivate: [noAuthGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/general/login/login-page.component')
            .then(m => m.LoginPageComponent)
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
