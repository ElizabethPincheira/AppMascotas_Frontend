import { Routes } from '@angular/router';
import { MainLayoutComponent } from './core/layout/main-layout/main-layout/main-layout.component';
import { AuthLayoutComponent } from './core/layout/auth-layout/auth-layout/auth-layout.component';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
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
        path: 'situacion-de-calle',
        loadComponent: () =>
          import('./pages/pet/lista-mascotas/lista-mascotas.component')
            .then(m => m.ListaMascotasComponent),
        data: { modo: 'calle' },
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
        path: 'carrito',
        loadComponent: () =>
          import('./pages/ecommer/carrito/carrito.component')
            .then(m => m.CarritoComponent)
      },
      {
        path: 'checkout',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./pages/ecommer/checkout/checkout.component')
            .then(m => m.CheckoutComponent)
      },
      {
        path: 'colaboradores/postulacion',
        loadComponent: () =>
          import('./pages/pet/colaboradores/colaboradores-postulacion.component')
            .then(m => m.ColaboradoresPostulacionComponent)
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
        path: 'mascotas/:id',
        loadComponent: () =>
          import('./pages/pet/detalle-mascota/detalle-mascota.component')
            .then(m => m.DetalleMascotaComponent)
      },
      {
        path: 'publicar',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./pages/pet/publicar/publicar.component')
            .then(m => m.PublicarComponent)
      },
      {
        path: 'situacion-de-calle/publicar',
        loadComponent: () =>
          import('./pages/pet/publicar/publicar.component')
            .then(m => m.PublicarComponent),
        data: { modoPublicacion: 'calle-publica' },
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
      },
      {
        path: 'registrar-tienda',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./pages/general/registrar-tienda/registrar-tienda.component')
            .then(m => m.RegistrarTiendaComponent)
      },
      {
        path: 'mi-tienda',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./pages/general/mi-tienda/mi-tienda.component')
            .then(m => m.MiTiendaComponent)
      },
      {
        path: 'pedidos-tienda',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./pages/general/pedidos-tienda/pedidos-tienda.component')
            .then(m => m.PedidosTiendaComponent)
      },
      {
        path: 'mis-compras',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./pages/general/mis-compras/mis-compras.component')
            .then(m => m.MisComprasComponent)
      },
      {
        path: 'admin',
        canActivate: [authGuard, adminGuard],
        loadComponent: () =>
          import('./pages/general/admin/admin.component')
            .then(m => m.AdminComponent)
      },
      {
        path: 'admin/usuarios',
        canActivate: [authGuard, adminGuard],
        loadComponent: () =>
          import('./pages/general/admin/admin-users.component')
            .then(m => m.AdminUsersComponent)
      },
      {
        path: 'admin/tiendas',
        canActivate: [authGuard, adminGuard],
        loadComponent: () =>
          import('./pages/general/admin/admin-tiendas.component')
            .then(m => m.AdminTiendasComponent)
      },
      {
        path: 'admin/colaboradores',
        canActivate: [authGuard, adminGuard],
        loadComponent: () =>
          import('./pages/general/admin/admin-colaboradores.component')
            .then(m => m.AdminColaboradoresComponent)
      },
      {
        path: 'terminos',
        loadComponent: () =>
          import('./pages/general/terminos/terminos.component')
            .then(m => m.TerminosComponent)
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
    path: 'recuperar-password',
    component: AuthLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/general/recuperar-password/recuperar-password.component')
            .then(m => m.RecuperarPasswordComponent)
      },
    ],
  },
  {
    path: 'nueva-password',
    component: AuthLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/general/nueva-password/nueva-password.component')
            .then(m => m.NuevaPasswordComponent)
      },
    ],
  },
  {
    path: 'verificar-email',
    component: AuthLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/general/verificar-email/verificar-email.component')
            .then(m => m.VerificarEmailComponent)
      },
    ],
  },
  {
    path: '**',
    loadComponent: () =>
      import('./pages/general/not-found/not-found.component')
        .then(m => m.NotFoundComponent),
  },
];
