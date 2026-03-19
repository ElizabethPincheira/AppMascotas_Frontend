import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-colaboradores',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './colaboradores.component.html',
  styleUrls: ['./colaboradores.component.css']
})
export class ColaboradoresComponent {
  readonly collaborationAreas = [
    {
      title: 'Venta y reparto de alimento',
      text: 'Tiendas o personas que quieran repartir alimento a domicilio. Quienes participen en esta categoría podrán aparecer luego en la pestaña Tienda.',
      tag: 'Conexión con Tienda'
    },
    {
      title: 'Servicios veterinarios',
      text: 'Veterinarios, clínicas o profesionales independientes que quieran ofrecer consultas, vacunación, orientación o apoyo en urgencias.',
      tag: 'Salud animal'
    },
    {
      title: 'Buscadores de mascotas perdidas',
      text: 'Personas que en sus tiempos libres quieran ayudar a recorrer zonas, pegar avisos, difundir casos y apoyar búsquedas activas.',
      tag: 'Ayuda comunitaria'
    },
    {
      title: 'Casas de acogida temporal',
      text: 'Hogares dispuestos a recibir animales por un tiempo mientras encuentran familia, se recuperan o esperan adopción.',
      tag: 'Acogida solidaria'
    }
  ];

  readonly processSteps = [
    'Te registras como parte de la red de ayuda.',
    'Tu perfil queda asociado al tipo de colaboración que puedes ofrecer.',
    'Más adelante podrás ser visible en la plataforma según tu zona y servicio.'
  ];
}
