import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Mascota } from '../../../../shared/models/mascota.model';
import { MascotaService } from '../../../../core/services/mascota.service';
import { CardMascotaComponent } from '../../../../shared/molecules/card-mascota/card-mascota.component';

@Component({
  selector: 'app-pets-page',
  imports: [CommonModule, CardMascotaComponent],
  templateUrl: './pets-page.component.html',
  styleUrls: ['./pets-page.component.css']
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

  hasAnySectionData(): boolean {
    return this.mascotasPerdidasRecientes.length > 0 || this.mascotasEnAdopcion.length > 0;
  }
}
