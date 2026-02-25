import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router'; // 1. Importar desde el router

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive], // 2. Agregar a imports
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {

}
