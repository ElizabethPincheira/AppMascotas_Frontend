import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-fauna',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './fauna.component.html',
  styleUrls: ['./fauna.component.css']
})
export class FaunaComponent {
  readonly threats = [
    {
      title: 'Perdida de habitat',
      text: 'La expansion urbana, los incendios y la fragmentacion de ecosistemas desplazan especies que dependen de bosques, humedales y costas sanas.',
    },
    {
      title: 'Mascotas sin control',
      text: 'Perros y gatos sin supervision pueden perseguir, herir o transmitir enfermedades a aves, reptiles y pequenos mamiferos nativos.',
    },
    {
      title: 'Basura y contaminacion',
      text: 'Plasticos, residuos y ruido afectan rutas de alimentacion, nidificacion y refugio de muchas especies del pais.',
    },
  ];

  readonly species = [
    {
      name: 'Zorro chilote',
      region: 'Bosques templados del sur',
      note: 'Una de las especies mas amenazadas del pais, sensible a la perdida de bosque nativo y a los perros asilvestrados.',
    },
    {
      name: 'Pudu',
      region: 'Zona sur y austral',
      note: 'El ciervo mas pequeno del mundo necesita corredores seguros, bosque denso y comunidades que respeten su espacio.',
    },
    {
      name: 'Chungungo',
      region: 'Costa rocosa del Pacifico',
      note: 'Depende de mares limpios y bordes costeros protegidos para sobrevivir y reproducirse.',
    },
  ];

  readonly actions = [
    'No alimentes fauna silvestre ni intentes domesticarla.',
    'Mantén a tus mascotas con correa, identificación y esterilización.',
    'Si ves un animal herido, contacta a autoridades o centros especializados.',
    'Respeta senderos, humedales y zonas de nidificación.',
  ];
}
