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
  modo: 'perdidos' | 'adopcion' = 'perdidos';
  ubicacionUsuarioDisponible = false;
  readonly estadosPerdidos = ['Robado', 'Extraviado', 'Encontrado', 'Recuperado'];
  readonly estadosAdopcion = ['Busca hogar', 'Adoptado'];

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
    return this.modo === 'adopcion' ? 'Mascotas En Adopcion' : 'Mascotas Perdidas';
  }

  get pageDescription(): string {
    const suffix = this.ubicacionUsuarioDisponible
      ? 'Se ordenan desde las más cercanas a tu ubicación.'
      : 'Si habilitas tu ubicación, las verás desde las más cercanas a las más lejanas.';

    return this.modo === 'adopcion'
      ? `Explora publicaciones activas de mascotas que buscan una nueva familia. ${suffix}`
      : `Revisa reportes recientes para ayudar a encontrar y reencontrar mascotas. ${suffix}`;
  }

  get pageBadge(): string {
    return this.modo === 'adopcion' ? 'Adopcion activa' : 'Busqueda comunitaria';
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
