import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ButtonComponent } from './shared/atoms/button/button.component';
import { CardMascotaComponent } from './shared/molecules/card-mascota/card-mascota.component';
import { Mascota } from './shared/models/mascota.model';
import { MascotaService } from './shared/service/mascota.service';



@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ButtonComponent, CardMascotaComponent, CommonModule],
  templateUrl: './app.component.html',
})
export class AppComponent {

  trackById(index: number, mascota: Mascota) {
    return mascota.id;
  }

  mascotas: Mascota[] = [];

  constructor(private mascotaService: MascotaService) { }

  ngOnInit() {

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
        estado: 'Extraviado',
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
        estado: 'Encontrado',
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
        estado: 'Recuperado',
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
        estado: 'Busca hogar',
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
        estado: 'Adoptado',
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
        estado: 'Buscando pareja',
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
        estado: 'Emparejado',
        descripcion: 'Perro lindo y juguetón',
        imagenUrl: ''
      }




    ];

    // Ahora pedimos una imagen para cada mascota
    this.mascotas.forEach(mascota => {
      this.mascotaService.getImagen().subscribe(url => {
        mascota.imagenUrl = url;
      });
    });

  }
}
