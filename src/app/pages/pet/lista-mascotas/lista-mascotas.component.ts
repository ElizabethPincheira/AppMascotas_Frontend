import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MascotaService } from '../../../core/services/mascota.service';
import { CardMascotaComponent } from '../../../shared/molecules/card-mascota/card-mascota.component';
import { Mascota } from '../../../shared/models/mascota.model';

@Component({
  selector: 'app-lista-mascotas',
  imports: [CommonModule, RouterLink, CardMascotaComponent],
  templateUrl: './lista-mascotas.component.html',
  styleUrls: ['./lista-mascotas.component.css']
})
export class ListaMascotasComponent {
  mascotas: Mascota[] = [];
  modo: 'perdidos' | 'adopcion' = 'perdidos';
  readonly estadosPerdidos = ['Robado', 'Extraviado', 'Encontrado', 'Recuperado'];
  readonly estadosAdopcion = ['Busca hogar', 'Adoptado'];

  constructor(
    private mascotaService: MascotaService,
    private route: ActivatedRoute,
  ) {}

  async ngOnInit() {
    this.modo = this.route.snapshot.data['modo'] ?? 'perdidos';
    this.mascotas = [...await this.mascotaService.getMascotas()];
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
        const dateA = new Date(a.createdAt ?? 0).getTime();
        const dateB = new Date(b.createdAt ?? 0).getTime();
        return dateB - dateA;
      });
  }

  get pageTitle(): string {
    return this.modo === 'adopcion' ? 'Mascotas En Adopcion' : 'Mascotas Perdidas';
  }

  get pageDescription(): string {
    return this.modo === 'adopcion'
      ? 'Explora publicaciones activas de mascotas que buscan una nueva familia.'
      : 'Revisa reportes recientes para ayudar a encontrar y reencontrar mascotas.';
  }

  get pageBadge(): string {
    return this.modo === 'adopcion' ? 'Adopcion activa' : 'Busqueda comunitaria';
  }
}
