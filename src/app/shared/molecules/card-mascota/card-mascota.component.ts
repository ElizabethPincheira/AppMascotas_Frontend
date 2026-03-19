import { CommonModule } from '@angular/common';
import { Component, Input, } from '@angular/core';
import { Mascota } from '../../models/mascota.model';

@Component({
  selector: 'app-card-mascota',
  imports: [CommonModule],
  templateUrl: './card-mascota.component.html',
  styleUrls: ['./card-mascota.component.css']
})
export class CardMascotaComponent {

  @Input() mascota!: Mascota;

  get carouselId(): string {
    return `carousel-${this.mascota._id ?? this.mascota.id ?? this.mascota.nombre}`;
  }

  getImageSrc(imagen?: string): string {
    if (!imagen) {
      return this.getFallbackImage();
    }

    if (imagen.startsWith('http://') || imagen.startsWith('https://') || imagen.startsWith('data:')) {
      return imagen;
    }

    return `data:image/jpeg;base64,${imagen}`;
  }

  getOwnerLocation(): string | null {
    if (typeof this.mascota.usuarioId !== 'object' || !this.mascota.usuarioId) {
      return null;
    }

    return this.mascota.usuarioId.comuna ?? this.mascota.usuarioId.ciudad ?? null;
  }

  getSecondaryLocation(): string | null {
    const ownerLocation = this.getOwnerLocation();
    return ownerLocation && ownerLocation !== this.getPrimaryLocation() ? ownerLocation : null;
  }

  getOwnerEmail(): string | null {
    if (typeof this.mascota.usuarioId !== 'object' || !this.mascota.usuarioId?.email) {
      return null;
    }

    return this.mascota.usuarioId.email;
  }

  getPrimaryLocation(): string {
    return (
      this.mascota.ubicacionPerdida ??
      this.mascota.comunaPerdida ??
      this.mascota.ubicacion ??
      this.getOwnerLocation() ??
      'Ubicación no informada'
    );
  }

  getAgeText(): string | null {
    if (!this.mascota.fechaNacimiento) {
      return null;
    }

    const birthDate = new Date(this.mascota.fechaNacimiento);

    if (Number.isNaN(birthDate.getTime())) {
      return null;
    }

    const now = new Date();
    let years = now.getFullYear() - birthDate.getFullYear();
    let months = now.getMonth() - birthDate.getMonth();

    if (months < 0) {
      years -= 1;
      months += 12;
    }

    if (years > 0) {
      return `${years} ${years === 1 ? 'año' : 'años'}`;
    }

    return `${Math.max(months, 1)} ${months === 1 ? 'mes' : 'meses'}`;
  }

  getPublishedText(): string | null {
    if (!this.mascota.createdAt) {
      return null;
    }

    const createdAt = new Date(this.mascota.createdAt);

    if (Number.isNaN(createdAt.getTime())) {
      return null;
    }

    return createdAt.toLocaleDateString('es-CL', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  getEmotionalMessage(): string {
    switch (this.mascota.estado) {
      case 'Robado':
      case 'Extraviado':
        return 'Me perdí, ayúdame a volver con mi familia.';
      case 'Encontrado':
        return 'Estoy esperando que alguien me reconozca.';
      case 'Busca hogar':
        return 'Estoy buscando una familia que me quiera.';
      case 'Adoptado':
        return 'Ya encontré una familia, gracias por ayudar.';
      default:
        return 'Ayúdame a que mi historia tenga un final feliz.';
    }
  }

  getFooterMessage(): string {
    if (this.getOwnerEmail()) {
      return 'Contacto disponible para actuar rápido';
    }

    if (this.mascota.estado === 'Busca hogar') {
      return 'Difunde esta publicación para encontrar un hogar';
    }

    return 'Comparte esta publicación y ayuda a encontrarlo';
  }

  getEstadoClase(estado: string): string {

    switch (estado) {
      case 'Robado':
        return 'estado-robado';

      case 'Extraviado':
        return 'estado-extraviado';

      case 'Encontrado':
        return 'estado-encontrado';

      case 'Recuperado':
        return 'estado-recuperado';

      case 'Busca hogar':
        return 'estado-busca-hogar';

      case 'Adoptado':
        return 'estado-adoptado';

      case 'Buscando pareja':
        return 'estado-buscando-pareja';

      case 'Emparejado':
        return 'estado-emparejado';

      default:
        return 'estado-default';
    }
  }

  private getFallbackImage(): string {
    const initial = (this.mascota?.nombre?.trim()?.charAt(0) || 'M').toUpperCase();
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 420">
        <defs>
          <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#edf7e7" />
            <stop offset="100%" stop-color="#f8ead3" />
          </linearGradient>
        </defs>
        <rect width="600" height="420" rx="36" fill="url(#bg)" />
        <circle cx="300" cy="165" r="90" fill="#ffffff" fill-opacity="0.92" />
        <text x="300" y="196" text-anchor="middle" font-family="Arial, sans-serif" font-size="92" font-weight="700" fill="#3f6f2b">${initial}</text>
        <text x="300" y="324" text-anchor="middle" font-family="Arial, sans-serif" font-size="30" fill="#2f4536">Circulo Animal</text>
      </svg>
    `;

    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  }
}
