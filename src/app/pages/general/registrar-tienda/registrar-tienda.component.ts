import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../../../core/services/auth.service';
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

  user = this.authService.getUser();
  enviandoTienda = false;

  storeForm = {
    nombreTienda: this.user?.nombreTienda || '',
    descripcionTienda: this.user?.descripcionTienda || '',
    direccionTienda: this.user?.direccionTienda || '',
    telefonoTienda: this.user?.telefonoTienda || '',
    categoriasTexto: Array.isArray(this.user?.categoriasTienda) ? this.user.categoriasTienda.join(', ') : '',
  };

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
      this.storeForm.telefonoTienda.trim()
    );
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
}
