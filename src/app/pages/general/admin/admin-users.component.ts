import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../../../core/services/auth.service';
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
  estado?: string;
  isActive?: boolean;
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
  private readonly authService = inject(AuthService);
  private readonly usersService = inject(UsersService);

  currentUser = this.authService.getUser();
  usuarios: AdminUser[] = [];
  cargandoUsuarios = true;
  procesandoUsuarioId: string | null = null;

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

  esMiUsuario(usuario: AdminUser): boolean {
    return `${usuario._id}` === `${this.currentUser?._id}`;
  }

  async toggleEstadoUsuario(usuario: AdminUser): Promise<void> {
    if (this.esMiUsuario(usuario)) {
      return;
    }

    const activar = !usuario.isActive;
    const accion = activar ? 'activar' : 'inactivar';

    const result = await Swal.fire({
      icon: 'question',
      title: `¿Quieres ${accion} este usuario?`,
      text: activar
        ? 'El usuario podrá volver a ingresar a la plataforma.'
        : 'El usuario dejará de poder iniciar sesión mientras esté inactivo.',
      showCancelButton: true,
      confirmButtonText: activar ? 'Activar' : 'Inactivar',
      cancelButtonText: 'Cancelar',
    });

    if (!result.isConfirmed) {
      return;
    }

    this.procesandoUsuarioId = usuario._id;

    try {
      const response = await this.usersService.updateAdminUserStatus(usuario._id, activar);
      const updatedUser = response?.user;

      this.usuarios = this.usuarios.map((item) =>
        item._id === usuario._id ? { ...item, ...updatedUser } : item
      );

      await Swal.fire({
        icon: 'success',
        title: activar ? 'Usuario activado' : 'Usuario inactivado',
        text: response?.message || 'El estado del usuario fue actualizado.',
        confirmButtonText: 'Continuar',
      });
    } catch (error: any) {
      await Swal.fire({
        icon: 'error',
        title: 'No se pudo actualizar',
        text: error?.response?.data?.message || 'Ocurrio un problema al cambiar el estado del usuario.',
        confirmButtonText: 'Entendido',
      });
    } finally {
      this.procesandoUsuarioId = null;
    }
  }

  async eliminarUsuario(usuario: AdminUser): Promise<void> {
    if (this.esMiUsuario(usuario)) {
      return;
    }

    const result = await Swal.fire({
      icon: 'warning',
      title: '¿Eliminar usuario?',
      text: `Se eliminará a ${usuario.nombre} de forma permanente.`,
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc2626',
    });

    if (!result.isConfirmed) {
      return;
    }

    this.procesandoUsuarioId = usuario._id;

    try {
      const response = await this.usersService.deleteAdminUser(usuario._id);
      this.usuarios = this.usuarios.filter((item) => item._id !== usuario._id);

      await Swal.fire({
        icon: 'success',
        title: 'Usuario eliminado',
        text: response?.message || 'El usuario fue eliminado correctamente.',
        confirmButtonText: 'Continuar',
      });
    } catch (error: any) {
      await Swal.fire({
        icon: 'error',
        title: 'No se pudo eliminar',
        text: error?.response?.data?.message || 'Ocurrio un problema al eliminar el usuario.',
        confirmButtonText: 'Entendido',
      });
    } finally {
      this.procesandoUsuarioId = null;
    }
  }
}
