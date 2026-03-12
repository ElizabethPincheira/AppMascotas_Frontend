
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


    this.mascotas = [
      {
        id: 1,
        nombre: 'Perricola',
        tipo: 'Perro',
        raza: 'Mestizo',
        chip: null,
        ubicacion: 'La Serena',
        estado: 'Robado',
        descripcion: 'Perro lindo que mueve la cola',
        imagenUrl: ''
      },
      {
        id: 2,
        nombre: 'Patroclo',
        tipo: 'Perro',
        raza: 'Mestizo',
        chip: null,
        ubicacion: 'Av. Central',
        estado: 'Robado',
        descripcion: 'Perro lindo y juguetón',
        imagenUrl: ''
      },
      {
        id: 3,
        nombre: 'Bobby',
        tipo: 'Perro',
        raza: 'Mestizo',
        chip: null,
        ubicacion: 'Av. Central',
        estado: 'Robado',
        descripcion: 'Perro lindo y juguetón',
        imagenUrl: ''
      },
      {
        id: 4,
        nombre: 'Luna',
        tipo: 'Perro',
        raza: 'Mestizo',
        chip: null,
        ubicacion: 'Av. Central',
        estado: 'Robado',
        descripcion: 'Perro lindo y juguetón',
        imagenUrl: ''
      },
      {
        id: 5,
        nombre: 'Luna',
        tipo: 'Perro',
        raza: 'Mestizo',
        chip: null,
        ubicacion: 'Av. Central',
        estado: 'Robado',
        descripcion: 'Perro lindo y juguetón',
        imagenUrl: ''
      },
      {
        id: 6,
        nombre: 'Luna',
        tipo: 'Perro',
        raza: 'Mestizo',
        chip: null,
        ubicacion: 'Av. Central',
        estado: 'Robado',
        descripcion: 'Perro lindo y juguetón',
        imagenUrl: ''
      },
      {
        id: 7,
        nombre: 'Luna',
        tipo: 'Perro',
        raza: 'Mestizo',
        chip: null,
        ubicacion: 'Av. Central',
        estado: 'Robado',
        descripcion: 'Perro lindo y juguetón',
        imagenUrl: ''
      },
      {
        id: 8,
        nombre: 'Luna',
        tipo: 'Perro',
        raza: 'Mestizo',
        chip: null,
        ubicacion: 'Av. Central',
        estado: 'Robado',
        descripcion: 'Perro lindo y juguetón',
        imagenUrl: ''
      }




    ];


    for (let mascota of this.mascotas) {
      mascota.imagenUrl = await this.mascotaService.getImagen();
    }

    console.log(this.mascotas, 'mascotas');
  }



  // Ahora pedimos una imagen para cada mascota
  async cargarImagen() {
    try {
      const imagen = await this.mascotaService.getImagen();
      this.imagenUrl = imagen;
    } catch (error) {
      console.error(error);
    }
  }



}
