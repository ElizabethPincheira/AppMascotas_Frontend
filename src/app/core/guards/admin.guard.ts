import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

const ADMIN_ROLES = ['admin', 'administrador'];

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const user = authService.getUser();
  const roles = Array.isArray(user?.roles)
    ? user.roles.map((role: string) => role.toLowerCase())
    : [];

  if (authService.isLogged() && roles.some((role: string) => ADMIN_ROLES.includes(role))) {
    return true;
  }

  router.navigate(['/']);
  return false;
};
