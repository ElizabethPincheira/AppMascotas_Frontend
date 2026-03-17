import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UsersService } from '../../../../core/services/users.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../../../../core/services/auth.service';

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

  constructor(private usersService: UsersService, private router: Router, private authService: AuthService) { }


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


    try {

      this.respuesta = await this.usersService.login(
        this.email,
        this.password);

      console.log(this.respuesta, 'respuesta del servidor');

      // Validación por seguridad
      if (!this.respuesta?.token) {
        throw new Error('Sin token');
      }


      //guarda el token 
      localStorage.setItem('token', this.respuesta.token);
      //guarda el user
      this.authService.setUser(this.respuesta.user);
      localStorage.setItem('token', this.respuesta.token);


      //Cerrar loading correctamente
      Swal.close();

      console.log(this.respuesta.user.nombre, 'nombre desde el servidor');

      //Esperar el success antes de navegar
      await Swal.fire({
        icon: 'success',
        title: `Bienvenido ${this.respuesta.user.nombre}`,
        text: 'Has iniciado sesión correctamente'
      })

      this.router.navigate(['/']);


    } catch (error) {

      console.log('ANTES DE CERRAR SWAL');

      Swal.close();

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo iniciar sesión'
      });

      console.error(error);
    }





  }
}


//1. usuario escribe datos
//2. llamo al backend
//3. backend responde
//4. guardo token
//5. muestro mensaje
//6. redirijo

