import { APP_INITIALIZER, ApplicationConfig, inject, LOCALE_ID, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http'; //para conectar API de imagenes para las cards
import axios from 'axios';

import { routes } from './app.routes';
import { AuthService } from './core/services/auth.service';

let axiosAuthRedirectInitialized = false;

function setupAxiosAuthRedirect(): () => void {
  const router = inject(Router);
  const authService = inject(AuthService);

  return () => {
    if (axiosAuthRedirectInitialized) {
      return;
    }

    axiosAuthRedirectInitialized = true;

    axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error?.response?.status === 401) {
          authService.logout();

          if (router.url !== '/login') {
            await router.navigate(['/login']);
          }
        }

        return Promise.reject(error);
      },
    );
  };
}

function hydrateAuthenticatedUser(): () => Promise<void> {
  const authService = inject(AuthService);

  return async () => {
    if (!authService.getToken()) {
      return;
    }

    try {
      await authService.refreshCurrentUser();
    } catch {
      // Si el token ya no es valido, refreshCurrentUser limpia la sesion.
    }
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideHttpClient(),
    provideRouter(routes),
    {
      provide: LOCALE_ID,
      useValue: 'es-CL',
    },
    {
      provide: APP_INITIALIZER,
      multi: true,
      useFactory: setupAxiosAuthRedirect,
    },
    {
      provide: APP_INITIALIZER,
      multi: true,
      useFactory: hydrateAuthenticatedUser,
    },
  ]
};
