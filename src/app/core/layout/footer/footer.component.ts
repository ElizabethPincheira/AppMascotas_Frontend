import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  imports: [CommonModule, RouterModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent {
  readonly mainLinks = [
    { label: 'Inicio', path: '/' },
    { label: 'Perdidos', path: '/perdidos' },
    { label: 'Adopcion', path: '/adopcion' },
    { label: 'Publicar', path: '/publicar' },
  ];

  readonly infoLinks = [
    { label: 'Tienda', path: '/tienda' },
    { label: 'Fauna', path: '/fauna' },
    { label: 'Donaciones', path: '/donar' },
    { label: 'Conocenos', path: '/about' },
  ];
}
