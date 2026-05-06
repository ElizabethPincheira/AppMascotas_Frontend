import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../../core/services/seo.service';

@Component({
  selector: 'app-terminos',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './terminos.component.html',
  styleUrls: ['./terminos.component.css']
})
export class TerminosComponent {
  constructor(private seoService: SeoService) {
    this.seoService.setPage(
      'Terminos y Condiciones | Circulo Animal',
      'Revisa los terminos y condiciones de uso de Circulo Animal para publicaciones, colaboraciones, donaciones y tienda.'
    );
  }

  fechaActualizacion = new Date();
}
