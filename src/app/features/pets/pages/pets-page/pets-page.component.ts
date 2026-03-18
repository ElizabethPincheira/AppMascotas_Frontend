import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Mascota } from '../../../../shared/models/mascota.model';
import { MascotaService } from '../../../../core/services/mascota.service';

@Component({
  selector: 'app-pets-page',
  imports: [CommonModule],
  templateUrl: './pets-page.component.html',
  styleUrl: './pets-page.component.css'
})
export class PetsPageComponent {
  trackById(index: number, mascota: Mascota) {
    return mascota._id ?? mascota.id ?? index;
  }

  mascotas: Mascota[] = [];
  readonly estadosPerdidos = ['Robado', 'Extraviado', 'Encontrado', 'Recuperado'];
  readonly estadosAdopcion = ['Busca hogar', 'Adoptado'];

  constructor(private mascotaService: MascotaService) { }

  async ngOnInit() {
    this.mascotas = [...await this.mascotaService.getMascotas()];
  }

  get mascotasPerdidasRecientes(): Mascota[] {
    return this.mascotas
      .filter((mascota) => this.estadosPerdidos.includes(mascota.estado))
      .slice(0, 4);
  }

  get mascotasEnAdopcion(): Mascota[] {
    return this.mascotas
      .filter((mascota) => this.estadosAdopcion.includes(mascota.estado))
      .slice(0, 4);
  }

  getImageSrc(mascota: Mascota): string {
    const firstImage = mascota.imagenes?.[0];

    if (!firstImage) {
      return this.getFallbackImage(mascota.nombre);
    }

    if (firstImage.startsWith('http://') || firstImage.startsWith('https://') || firstImage.startsWith('data:')) {
      return firstImage;
    }

    return `data:image/jpeg;base64,${firstImage}`;
  }

  getSubtitle(mascota: Mascota): string {
    if (this.estadosAdopcion.includes(mascota.estado)) {
      return mascota.estado === 'Adoptado'
        ? 'Ya encontro una familia'
        : `Listo para adopcion${mascota.raza ? ` · ${mascota.raza}` : ''}`;
    }

    return mascota.ubicacion
      ? `${mascota.estado} en ${mascota.ubicacion}`
      : `${mascota.estado}${mascota.especie ? ` · ${mascota.especie}` : ''}`;
  }

  getActionLabel(mascota: Mascota): string {
    return this.estadosAdopcion.includes(mascota.estado) ? 'Adoptar' : 'Ver Detalles';
  }

  getOwnerName(mascota: Mascota): string | null {
    if (typeof mascota.usuarioId === 'object' && mascota.usuarioId?.nombre) {
      return mascota.usuarioId.nombre;
    }

    return null;
  }

  hasAnySectionData(): boolean {
    return this.mascotasPerdidasRecientes.length > 0 || this.mascotasEnAdopcion.length > 0;
  }

  private getFallbackImage(nombre: string): string {
    const initial = (nombre?.trim()?.charAt(0) || 'M').toUpperCase();
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 420">
        <defs>
          <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#dff2d8" />
            <stop offset="100%" stop-color="#f8ead4" />
          </linearGradient>
        </defs>
        <rect width="600" height="420" fill="url(#bg)" rx="36" />
        <circle cx="300" cy="170" r="88" fill="#ffffff" fill-opacity="0.88" />
        <text x="300" y="196" text-anchor="middle" font-family="Arial, sans-serif" font-size="88" font-weight="700" fill="#3f6f2b">${initial}</text>
        <text x="300" y="330" text-anchor="middle" font-family="Arial, sans-serif" font-size="32" fill="#2e3d2f">Circulo Animal</text>
      </svg>
    `;

    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  }

}
