import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MascotaService } from '../../../core/services/mascota.service';
import { CardMascotaComponent } from '../../../shared/molecules/card-mascota/card-mascota.component';
import { Mascota } from '../../../shared/models/mascota.model';

@Component({
  selector: 'app-lista-mascotas',
  standalone: true,
  imports: [CommonModule, RouterLink, CardMascotaComponent],
  templateUrl: './lista-mascotas.component.html',
  styleUrls: ['./lista-mascotas.component.css']
})
export class ListaMascotasComponent {
  mascotas: Mascota[] = [];
  modo: 'perdidos' | 'adopcion' | 'calle' = 'perdidos';
  ubicacionUsuarioDisponible = false;
  readonly estadosPerdidos = ['Robado', 'Extraviado', 'Encontrado', 'Recuperado'];
  readonly estadosAdopcion = ['Busca hogar', 'Adoptado'];
  readonly estadosCalle = ['Situacion de calle'];

  constructor(
    private mascotaService: MascotaService,
    private route: ActivatedRoute,
  ) {}

  async ngOnInit() {
    this.modo = this.route.snapshot.data['modo'] ?? 'perdidos';
    const posicion = await this.obtenerUbicacionUsuario();
    this.mascotas = [
      ...await this.mascotaService.getMascotas(
        posicion
          ? {
              latitud: posicion.latitude,
              longitud: posicion.longitude,
            }
          : undefined,
      ),
    ];
  }

  trackById(index: number, mascota: Mascota) {
    return mascota._id ?? mascota.id ?? index;
  }

  get mascotasFiltradas(): Mascota[] {
    const allowedStates = this.modo === 'adopcion'
      ? this.estadosAdopcion
      : this.modo === 'calle'
        ? this.estadosCalle
        : this.estadosPerdidos;

    return this.mascotas
      .filter((mascota) => allowedStates.includes(mascota.estado))
      .sort((a, b) => {
        const distanceA = typeof a.distanciaKm === 'number' ? a.distanciaKm : Number.POSITIVE_INFINITY;
        const distanceB = typeof b.distanciaKm === 'number' ? b.distanciaKm : Number.POSITIVE_INFINITY;

        if (distanceA !== distanceB) {
          return distanceA - distanceB;
        }

        const dateA = new Date(a.createdAt ?? 0).getTime();
        const dateB = new Date(b.createdAt ?? 0).getTime();
        return dateB - dateA;
      });
  }

  get pageTitle(): string {
    if (this.modo === 'adopcion') {
      return 'Mascotas En Adopcion';
    }

    if (this.modo === 'calle') {
      return 'Animales En Situacion De Calle';
    }

    return 'Mascotas Perdidas';
  }

  get pageDescription(): string {
    const suffix = this.ubicacionUsuarioDisponible
      ? 'Se ordenan desde las más cercanas a tu ubicación.'
      : 'Si habilitas tu ubicación, las verás desde las más cercanas a las más lejanas.';

    if (this.modo === 'adopcion') {
      return `Explora publicaciones activas de mascotas que buscan una nueva familia. ${suffix}`;
    }

    if (this.modo === 'calle') {
      return `Conoce animales que hoy viven en la calle y que necesitan una familia, refugio o una segunda oportunidad. ${suffix}`;
    }

    return `Revisa reportes recientes para ayudar a encontrar y reencontrar mascotas. ${suffix}`;
  }

  get pageBadge(): string {
    if (this.modo === 'adopcion') {
      return 'Adopcion activa';
    }

    if (this.modo === 'calle') {
      return 'Dar hogar';
    }

    return 'Busqueda comunitaria';
  }

  get ctaLink(): string {
    return this.modo === 'calle' ? '/situacion-de-calle/publicar' : '/publicar';
  }

  get ctaLabel(): string {
    return this.modo === 'calle' ? 'Publicar animal en calle' : 'Publicar caso';
  }

  private async obtenerUbicacionUsuario(): Promise<{ latitude: number; longitude: number } | null> {
    if (!navigator.geolocation) {
      return null;
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 8000,
          maximumAge: 300000,
        });
      });

      this.ubicacionUsuarioDisponible = true;

      return {
        latitude: Number(position.coords.latitude.toFixed(6)),
        longitude: Number(position.coords.longitude.toFixed(6)),
      };
    } catch {
      this.ubicacionUsuarioDisponible = false;
      return null;
    }
  }
}
