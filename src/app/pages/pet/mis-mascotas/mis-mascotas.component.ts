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
}
