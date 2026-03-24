import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

interface AdminShortcut {
  title: string;
  description: string;
  path: string;
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent {
  private readonly authService = inject(AuthService);

  readonly user = this.authService.getUser();
  readonly shortcuts: AdminShortcut[] = [
    {
      title: 'Ver usuarios',
      description: 'Consulta los usuarios registrados, sus roles y si cuentan con tienda activa.',
      path: '/admin/usuarios',
    },
    {
      title: 'Revisar tiendas',
      description: 'Accede a las tiendas registradas y valida la informacion publicada.',
      path: '/tiendas',
    },
    {
      title: 'Gestionar mascotas',
      description: 'Consulta las publicaciones activas y verifica el contenido que aparece en la plataforma.',
      path: '/mis-mascotas',
    },
    {
      title: 'Ver cuenta',
      description: 'Abre tu panel personal para actualizar tus datos o cambiar de seccion rapidamente.',
      path: '/mi-cuenta',
    },
  ];

  get displayName(): string {
    return this.user?.nombre || this.user?.name || this.user?.username || 'Administrador';
  }
}
