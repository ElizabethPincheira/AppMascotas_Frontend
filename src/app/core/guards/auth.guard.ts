import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {

  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLogged()) {
    const user = authService.getUser();

    if (user?.email_verified === false) {
      authService.requestVerificationBanner();
    }

    return true;
  }

  router.navigate(['/login']);
  return false;

};
