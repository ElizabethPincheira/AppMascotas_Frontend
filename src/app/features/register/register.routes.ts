import { Routes } from '@angular/router';
import { RegisterPageComponent } from './pages/register-page/register-page.component';
import { noAuthGuard } from '../../core/guards/no-auth.guard';

export const REGISTER_ROUTES: Routes = [
  {
    path: '',
    component: RegisterPageComponent,
    canActivate: [noAuthGuard]
  }
];
