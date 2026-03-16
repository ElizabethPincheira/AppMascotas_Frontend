import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UsersService } from '../../../../core/services/users.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login-page',
  imports: [FormsModule],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css'
})
export class LoginPageComponent {


  email: string = '';
  password: string = ''
  nombre: string = '';
  respuesta: any;

  constructor(private usersService: UsersService, private router: Router) { }


  async login() {
    const login = {
      email: this.email,
      password: this.password,

    };

    console.log(login, 'usuario logueado');

    Swal.fire({
      title: 'Iniciando sesión...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.respuesta = await this.usersService.login(
      this.email,
      this.password);

    console.log(this.respuesta, 'respuesta del servidor');

    console.log(this.respuesta.user.nombre, 'nombre desde el servidor');

    Swal.close();

    Swal.fire({
      icon: 'success',
      title: `Bienvenido ${this.respuesta.user.nombre}`,
      text: 'Has iniciado sesión correctamente'
    }).then(() => {

      this.router.navigate(['/']);

    });

  }
}