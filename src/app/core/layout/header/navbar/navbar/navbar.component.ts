import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router'; // 1. Importar desde el router
import { ButtonLoginComponent } from '../../../../../shared/atoms/button-login/button-login.component';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, ButtonLoginComponent], // 2. Agregar a imports
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {

}
