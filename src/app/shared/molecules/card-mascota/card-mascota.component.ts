import { CommonModule } from '@angular/common';
import { Component, Input, } from '@angular/core';
import { ButtonComponent } from '../../atoms/button/button.component';
import { Mascota } from '../../models/mascota.model';

@Component({
  selector: 'app-card-mascota',
  imports: [ButtonComponent, CommonModule],
  templateUrl: './card-mascota.component.html',
  styleUrl: './card-mascota.component.css'
})
export class CardMascotaComponent {

  @Input() mascota!: Mascota;

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
}

