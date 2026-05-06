import { Component, inject, OnInit } from '@angular/core';
import { SeoService } from '../../../core/services/seo.service';

@Component({
  selector: 'app-about-page',
  standalone: true,
  imports: [],
  templateUrl: './about-page.component.html',
  styleUrls: ['./about-page.component.css']
})
export class AboutPageComponent implements OnInit {
  private readonly seoService = inject(SeoService);

  ngOnInit(): void {
    this.seoService.setPage(
      'Sobre Circulo Animal | Comunidad por el bienestar animal',
      'Conoce la mision de Circulo Animal: conectar personas, rescates y adopciones responsables para ayudar a mascotas en Chile.'
    );
  }
}
