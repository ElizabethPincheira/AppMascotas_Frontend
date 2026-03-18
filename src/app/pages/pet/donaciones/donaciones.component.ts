import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-donaciones',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './donaciones.component.html',
  styleUrls: ['./donaciones.component.css']
})
export class DonacionesComponent {
  readonly donationUses = [
    {
      title: 'Alimento y agua',
      text: 'Aportes destinados a cubrir comida, insumos basicos y apoyo inmediato para animales rescatados o en recuperacion.',
    },
    {
      title: 'Atencion veterinaria',
      text: 'Consultas, medicamentos, controles, esterilizaciones y tratamientos para casos urgentes o de seguimiento.',
    },
    {
      title: 'Hogar y traslados',
      text: 'Apoyo para hogares temporales, transporte seguro, implementos de descanso y procesos de adopcion responsable.',
    },
  ];

  readonly trustPoints = [
    'El 100% de las donaciones se destina a ayuda directa para animales.',
    'Priorizamos casos de rescate, salud, alimentacion y adopcion.',
    'Cada aporte suma para sostener acciones concretas y urgentes.',
  ];

  readonly suggestedAmounts = ['5.000', '10.000', '20.000', '50.000'];
}
