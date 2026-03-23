import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../../../core/services/auth.service';
import { UbicacionesService } from '../../../core/services/ubicaciones.service';
import { UsersService } from '../../../core/services/users.service';

interface UserOption {
  title: string;
  description: string;
  path?: string;
  badge: string;
  tone: 'lime' | 'earth' | 'sky';
}

@Component({
  selector: 'app-mi-user',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './mi-user.component.html',
  styleUrl: './mi-user.component.css'
})
export class MiUserComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly usersService = inject(UsersService);
  private readonly ubicacionesService = inject(UbicacionesService);

  user = this.authService.getUser();
  regiones: string[] = [];
  provincias: string[] = [];
  comunas: string[] = [];
  cargandoRegiones = false;
  cargandoProvincias = false;
  cargandoComunas = false;
  guardandoPerfil = false;
  enviandoTienda = false;

  profileForm = {
    nombre: this.user?.nombre || '',
    email: this.user?.email || '',
    telefono: this.user?.telefono || '',
    region: this.user?.region || '',
    provincia: this.user?.provincia || '',
    comuna: this.user?.comuna || '',
  };

  storeForm = {
    nombreTienda: this.user?.nombreTienda || '',
    descripcionTienda: this.user?.descripcionTienda || '',
    direccionTienda: this.user?.direccionTienda || '',
    telefonoTienda: this.user?.telefonoTienda || '',
    categoriasTexto: Array.isArray(this.user?.categoriasTienda) ? this.user.categoriasTienda.join(', ') : '',
  };

  readonly userOptions: UserOption[] = [
    {
      title: 'Mis mascotas',
      description: 'Revisa tus publicaciones, edita informacion importante y administra tus casos activos.',
      path: '/mis-mascotas',
      badge: 'Panel personal',
      tone: 'lime'
    },
    {
      title: 'Publicar mascota',
      description: 'Crea una nueva publicacion para una mascota perdida, encontrada o en adopcion.',
      path: '/publicar',
      badge: 'Accion rapida',
      tone: 'earth'
    },
    {
      title: 'Tiendas solidarias',
      description: 'Explora tiendas, productos y opciones de compra relacionadas con la comunidad.',
      path: '/tiendas',
      badge: 'Explorar',
      tone: 'sky'
    }
  ];

  async ngOnInit(): Promise<void> {
    await this.cargarRegiones();

    if (this.profileForm.region) {
      await this.onRegionChange(false);
    }

    if (this.profileForm.provincia) {
      await this.onProvinciaChange(false);
    }
  }

  get displayName(): string {
    return this.user?.nombre || this.user?.name || this.user?.username || 'Usuario';
  }

  get email(): string {
    return this.user?.email || 'Sin correo registrado';
  }

  get estadoTienda(): string {
    return this.user?.estadoSolicitudTienda || 'ninguna';
  }

  get perfilCompleto(): boolean {
    return !!(
      this.profileForm.nombre.trim() &&
      this.profileForm.email.trim() &&
      this.profileForm.region &&
      this.profileForm.provincia &&
      this.profileForm.comuna
    );
  }

  get registroTiendaCompleto(): boolean {
    return !!(
      this.storeForm.nombreTienda.trim() &&
      this.storeForm.descripcionTienda.trim() &&
      this.storeForm.direccionTienda.trim() &&
      this.storeForm.telefonoTienda.trim()
    );
  }

  async onRegionChange(resetChildren = true): Promise<void> {
    if (resetChildren) {
      this.profileForm.provincia = '';
      this.profileForm.comuna = '';
      this.comunas = [];
    }

    this.provincias = [];

    if (!this.profileForm.region) {
      return;
    }

    this.cargandoProvincias = true;

    try {
      this.provincias = await this.ubicacionesService.getUbicaciones(this.profileForm.region);
    } finally {
      this.cargandoProvincias = false;
    }
  }

  async onProvinciaChange(resetComuna = true): Promise<void> {
    if (resetComuna) {
      this.profileForm.comuna = '';
    }

    this.comunas = [];

    if (!this.profileForm.region || !this.profileForm.provincia) {
      return;
    }

    this.cargandoComunas = true;

    try {
      this.comunas = await this.ubicacionesService.getUbicaciones(
        this.profileForm.region,
        this.profileForm.provincia,
      );
    } finally {
      this.cargandoComunas = false;
    }
  }

  async guardarPerfil(): Promise<void> {
    this.guardandoPerfil = true;

    try {
      const response = await this.usersService.updateProfile({
        nombre: this.profileForm.nombre.trim(),
        email: this.profileForm.email.trim(),
        telefono: this.profileForm.telefono.trim(),
        region: this.profileForm.region,
        provincia: this.profileForm.provincia,
        comuna: this.profileForm.comuna,
      });

      this.user = response.user;
      this.authService.setUser(response.user);

      await Swal.fire({
        icon: 'success',
        title: 'Perfil actualizado',
        text: response.message || 'Tus datos fueron guardados correctamente.',
        confirmButtonText: 'Continuar'
      });
    } catch (error: any) {
      await Swal.fire({
        icon: 'error',
        title: 'No se pudo actualizar',
        text: error?.response?.data?.message || 'Ocurrio un problema al guardar tu perfil.',
        confirmButtonText: 'Entendido'
      });
    } finally {
      this.guardandoPerfil = false;
    }
  }

  async registrarTienda(): Promise<void> {
    this.enviandoTienda = true;

    try {
      const categoriasTienda = this.storeForm.categoriasTexto
        .split(',')
        .map((item: string) => item.trim())
        .filter(Boolean);

      const response = await this.usersService.registerStore({
        nombreTienda: this.storeForm.nombreTienda.trim(),
        descripcionTienda: this.storeForm.descripcionTienda.trim(),
        direccionTienda: this.storeForm.direccionTienda.trim(),
        telefonoTienda: this.storeForm.telefonoTienda.trim(),
        categoriasTienda,
      });

      this.user = response.user;
      this.authService.setUser(response.user);

      await Swal.fire({
        icon: 'success',
        title: 'Solicitud enviada',
        text: response.message || 'Tu solicitud como tienda fue registrada.',
        confirmButtonText: 'Perfecto'
      });
    } catch (error: any) {
      await Swal.fire({
        icon: 'error',
        title: 'No se pudo registrar la tienda',
        text: error?.response?.data?.message || 'Ocurrio un problema al enviar tu solicitud.',
        confirmButtonText: 'Entendido'
      });
    } finally {
      this.enviandoTienda = false;
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  private async cargarRegiones(): Promise<void> {
    this.cargandoRegiones = true;

    try {
      this.regiones = await this.ubicacionesService.getUbicaciones();
    } finally {
      this.cargandoRegiones = false;
    }
  }
}
