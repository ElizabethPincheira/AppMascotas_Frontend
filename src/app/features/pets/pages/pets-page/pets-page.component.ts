
import { Component } from '@angular/core';
import { CardMascotaComponent } from '../../../../shared/molecules/card-mascota/card-mascota.component';
import { CommonModule } from '@angular/common';
import { Mascota } from '../../../../shared/models/mascota.model';
import { MascotaService } from '../../../../core/services/mascota.service';


@Component({
  selector: 'app-pets-page',
  imports: [CommonModule, CardMascotaComponent],
  templateUrl: './pets-page.component.html',
  styleUrl: './pets-page.component.css'
})
export class PetsPageComponent {

  trackById(index: number, mascota: Mascota) {
    return mascota.id;
  }

  mascotas: Mascota[] = [];

  imagenUrl: string = '';

  constructor(private mascotaService: MascotaService) { }

  async ngOnInit() {


    this.mascotas = [...await this.mascotaService.getMascotas()];



    console.log(this.mascotas, 'mascotas');
  }



}
