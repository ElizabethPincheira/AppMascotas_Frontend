import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'pets',
    pathMatch: 'full'
  },
  {
    path: 'pets',
    loadChildren: () =>
      import('./features/pets/pets.routes')
        .then(m => m.PETS_ROUTES)
  },



{
    path: 'about',
    loadChildren: () => import('./features/about/about.routes')
      .then(m => m.ABOUT_ROUTES)
  },


  {
    path: '**',
    redirectTo: 'pets'
  }
];
;

