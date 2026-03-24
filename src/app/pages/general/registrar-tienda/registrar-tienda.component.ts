import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../../../core/services/auth.service';
import { UbicacionesService } from '../../../core/services/ubicaciones.service';
import { UsersService } from '../../../core/services/users.service';

@Component({
  selector: 'app-registrar-tienda',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './registrar-tienda.component.html',
  styleUrl: './registrar-tienda.component.css'
})
export class RegistrarTiendaComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly usersService = inject(UsersService);
  private readonly ubicacionesService = inject(UbicacionesService);

  user = this.authService.getUser();
  enviandoTienda = false;
  regiones: string[] = [];
  provincias: string[] = [];
  comunas: string[] = [];
  cargandoRegiones = false;
  cargandoProvincias = false;
  cargandoComunas = false;

  storeForm = {
    nombreTienda: this.user?.nombreTienda || '',
    descripcionTienda: this.user?.descripcionTienda || '',
    direccionTienda: this.user?.direccionTienda || '',
    telefonoTienda: this.user?.telefonoTienda || '',
    regionTienda: this.user?.regionTienda || '',
    provinciaTienda: this.user?.provinciaTienda || '',
    comunaTienda: this.user?.comunaTienda || '',
    categoriasTexto: Array.isArray(this.user?.categoriasTienda) ? this.user.categoriasTienda.join(', ') : '',
    comunasRepartoSeleccionadas: Array.isArray(this.user?.comunasRepartoTienda) ? [...this.user.comunasRepartoTienda] : [],
  };

  async ngOnInit(): Promise<void> {
    await this.cargarRegiones();

    if (this.storeForm.regionTienda) {
      await this.onRegionChange(false);
    }

    if (this.storeForm.provinciaTienda) {
      await this.onProvinciaChange(false);
    }
  }

  get displayName(): string {
    return this.user?.nombre || this.user?.name || this.user?.username || 'Usuario';
  }

  get estadoTienda(): string {
    return this.user?.estadoSolicitudTienda || 'ninguna';
  }

  get registroTiendaCompleto(): boolean {
    return !!(
      this.storeForm.nombreTienda.trim() &&
      this.storeForm.descripcionTienda.trim() &&
      this.storeForm.direccionTienda.trim() &&
      this.storeForm.telefonoTienda.trim() &&
      this.storeForm.regionTienda &&
      this.storeForm.provinciaTienda &&
      this.storeForm.comunaTienda &&
      this.storeForm.comunasRepartoSeleccionadas.length > 0
    );
  }

  async onRegionChange(resetChildren = true): Promise<void> {
    if (resetChildren) {
      this.storeForm.provinciaTienda = '';
      this.storeForm.comunaTienda = '';
      this.comunas = [];
    }

    this.provincias = [];

    if (!this.storeForm.regionTienda) {
      return;
    }

    this.cargandoProvincias = true;

    try {
      this.provincias = await this.ubicacionesService.getUbicaciones(this.storeForm.regionTienda);
    } finally {
      this.cargandoProvincias = false;
    }
  }

  async onProvinciaChange(resetComuna = true): Promise<void> {
    if (resetComuna) {
      this.storeForm.comunaTienda = '';
    }

    this.comunas = [];

    if (!this.storeForm.regionTienda || !this.storeForm.provinciaTienda) {
      return;
    }

    this.cargandoComunas = true;

    try {
      this.comunas = await this.ubicacionesService.getUbicaciones(
        this.storeForm.regionTienda,
        this.storeForm.provinciaTienda,
      );
    } finally {
      this.cargandoComunas = false;
    }
  }

  toggleComunaReparto(comuna: string, checked: boolean): void {
    if (checked) {
      if (!this.storeForm.comunasRepartoSeleccionadas.includes(comuna)) {
        this.storeForm.comunasRepartoSeleccionadas = [
          ...this.storeForm.comunasRepartoSeleccionadas,
          comuna,
        ];
      }

      return;
    }

    this.storeForm.comunasRepartoSeleccionadas = this.storeForm.comunasRepartoSeleccionadas
      .filter((item) => item !== comuna);
  }

  isComunaRepartoSelected(comuna: string): boolean {
    return this.storeForm.comunasRepartoSeleccionadas.includes(comuna);
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
        regionTienda: this.storeForm.regionTienda,
        provinciaTienda: this.storeForm.provinciaTienda,
        comunaTienda: this.storeForm.comunaTienda,
        categoriasTienda,
        comunasRepartoTienda: this.storeForm.comunasRepartoSeleccionadas,
      });

      this.user = response.user;
      this.authService.setUser(response.user);

      await Swal.fire({
        icon: 'success',
        title: 'Solicitud enviada',
        text: response.message || 'Tu solicitud como tienda fue registrada.',
        confirmButtonText: 'Perfecto'
      });

      this.router.navigate(['/mi-cuenta']);
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

  volver(): void {
    this.router.navigate(['/mi-cuenta']);
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
