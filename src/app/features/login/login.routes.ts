import { Routes } from '@angular/router';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { noAuthGuard } from '../../core/guards/no-auth.guard';

export const LOGIN_ROUTES: Routes = [
  {
    path: '',
    component: LoginPageComponent,
    canActivate: [noAuthGuard]
  }
];
