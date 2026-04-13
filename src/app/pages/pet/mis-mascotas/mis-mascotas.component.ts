import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../../../core/services/auth.service';
import { MascotaService } from '../../../core/services/mascota.service';
import { Mascota } from '../../../shared/models/mascota.model';

@Component({
  selector: 'app-mis-mascotas',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './mis-mascotas.component.html',
  styleUrls: ['./mis-mascotas.component.css']
})
export class MisMascotasComponent {
  private readonly authService = inject(AuthService);
  private readonly mascotaService = inject(MascotaService);
  private readonly router = inject(Router);
  private readonly estadosResueltos: Array<Mascota['estado']> = ['Recuperado', 'Adoptado', 'Emparejado'];

  mascotas: Mascota[] = [];
  cargando = true;
  user = this.authService.getUser();

  async ngOnInit(): Promise<void> {
    await this.cargarMascotas();
  }

  async cargarMascotas(): Promise<void> {
    this.cargando = true;
    try {
      const ownerId = this.user?._id ?? this.user?.id;
      this.mascotas = ownerId ? await this.mascotaService.getMascotasByOwner(ownerId) : [];
    } finally {
      this.cargando = false;
    }
  }

  getImageSrc(imagen?: string): string {
    if (!imagen) {
      return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 420">
          <rect width="600" height="420" fill="#edf4e6" />
          <text x="300" y="210" text-anchor="middle" font-family="Arial" font-size="34" fill="#35523c">Sin imagen</text>
        </svg>
      `);
    }

    if (imagen.startsWith('http://') || imagen.startsWith('https://') || imagen.startsWith('data:')) {
      return imagen;
    }

    return `data:image/jpeg;base64,${imagen}`;
  }

  async eliminarMascota(mascota: Mascota): Promise<void> {
    const id = mascota._id ?? mascota.id;

    if (!id) {
      return;
    }

    const confirmacion = await Swal.fire({
      icon: 'warning',
      title: '¿Eliminar mascota?',
      text: `Se eliminará la publicación de ${mascota.nombre}.`,
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (!confirmacion.isConfirmed) {
      return;
    }

    await this.mascotaService.deleteMascota(String(id));

    await Swal.fire({
      icon: 'success',
      title: 'Mascota eliminada',
      text: 'La publicación fue eliminada correctamente.'
    });

    await this.cargarMascotas();
  }

  editarMascota(mascota: Mascota): void {
    const id = mascota._id ?? mascota.id;
    if (!id) {
      return;
    }

    this.router.navigate(['/publicar', id]);
  }

  esCasoResuelto(mascota: Mascota): boolean {
    return this.estadosResueltos.includes(mascota.estado);
  }

  puedeMarcarComoResuelto(mascota: Mascota): boolean {
    if (this.esCasoResuelto(mascota)) {
      return false;
    }

    const ownerId = this.obtenerUsuarioId(this.user);
    const mascotaOwnerId = this.obtenerUsuarioId(mascota.usuarioId);

    return !!ownerId && !!mascotaOwnerId && ownerId === mascotaOwnerId;
  }

  async marcarCasoComoResuelto(mascota: Mascota): Promise<void> {
    const id = mascota._id ?? mascota.id;

    if (!id || !this.puedeMarcarComoResuelto(mascota)) {
      return;
    }

    const confirmacion = await Swal.fire({
      icon: 'question',
      title: '¿Confirmás que tu mascota fue encontrada o el caso está resuelto?',
      input: 'select',
      inputOptions: {
        Recuperado: 'Recuperado',
        Adoptado: 'Adoptado',
        Emparejado: 'Emparejado',
      },
      inputPlaceholder: 'Selecciona el nuevo estado',
      inputValue: 'Recuperado',
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar',
      inputValidator: (value) => {
        if (!value) {
          return 'Debes elegir un estado para continuar.';
        }

        return null;
      },
    });

    if (!confirmacion.isConfirmed || !confirmacion.value) {
      return;
    }

    await this.mascotaService.updateMascota(String(id), {
      estado: confirmacion.value,
    });

    this.mascotas = this.mascotas.map((item) => {
      const itemId = item._id ?? item.id;

      if (String(itemId) !== String(id)) {
        return item;
      }

      return {
        ...item,
        estado: confirmacion.value,
      };
    });

    await Swal.fire({
      icon: 'success',
      title: 'Caso actualizado',
      text: 'La publicación fue marcada como resuelta.',
    });
  }

  private obtenerUsuarioId(usuario: Mascota['usuarioId'] | { _id?: string; id?: string } | null | undefined): string | null {
    if (!usuario) {
      return null;
    }

    if (typeof usuario === 'string') {
      return usuario;
    }

    if ('id' in usuario && usuario.id) {
      return usuario.id;
    }

    return usuario._id ?? null;
  }
}
