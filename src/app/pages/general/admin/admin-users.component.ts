import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UsersService } from '../../../core/services/users.service';

interface AdminUser {
  _id: string;
  nombre: string;
  email: string;
  telefono?: string;
  region?: string;
  provincia?: string;
  comuna?: string;
  roles?: string[];
  esTienda?: boolean;
  estadoSolicitudTienda?: string;
  createdAt?: string;
}

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-users.component.html',
  styleUrl: './admin-users.component.css'
})
export class AdminUsersComponent {
  private readonly usersService = inject(UsersService);

  usuarios: AdminUser[] = [];
  cargandoUsuarios = true;

  async ngOnInit(): Promise<void> {
    try {
      const response = await this.usersService.getAdminUsers();
      this.usuarios = Array.isArray(response?.users) ? response.users : [];
    } finally {
      this.cargandoUsuarios = false;
    }
  }

  get totalUsuarios(): number {
    return this.usuarios.length;
  }

  get totalTiendas(): number {
    return this.usuarios.filter((usuario) => usuario.esTienda).length;
  }

  get totalAdmins(): number {
    return this.usuarios.filter((usuario) =>
      Array.isArray(usuario.roles) &&
      usuario.roles.some((role) => ['admin', 'administrador'].includes(String(role).toLowerCase()))
    ).length;
  }

  formatRoles(roles?: string[]): string {
    if (!Array.isArray(roles) || roles.length === 0) {
      return 'Sin roles';
    }

    return roles.join(', ');
  }

  formatUbicacion(usuario: AdminUser): string {
    return [usuario.comuna, usuario.provincia, usuario.region].filter(Boolean).join(', ') || 'Sin ubicacion';
  }
}
