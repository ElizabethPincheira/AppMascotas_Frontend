import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Mascota } from '../../../shared/models/mascota.model';
import { MascotaService } from '../../../core/services/mascota.service';
import { CardMascotaComponent } from '../../../shared/molecules/card-mascota/card-mascota.component';

@Component({
  selector: 'app-pets-page',
  standalone: true,
  imports: [CommonModule, RouterLink, CardMascotaComponent],
  templateUrl: './pets-page.component.html',
  styleUrls: ['./pets-page.component.css']
})
export class PetsPageComponent {
  trackById(index: number, mascota: Mascota) {
    return mascota._id ?? mascota.id ?? index;
  }

  mascotas: Mascota[] = [];
  ubicacionUsuarioDisponible = false;
  readonly estadosPerdidos = ['Robado', 'Extraviado', 'Encontrado', 'Recuperado'];
  readonly estadosAdopcion = ['Busca hogar', 'Adoptado'];

  constructor(private mascotaService: MascotaService) { }

  async ngOnInit() {
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

  hasAnySectionData(): boolean {
    return this.mascotasPerdidasRecientes.length > 0 || this.mascotasEnAdopcion.length > 0;
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
