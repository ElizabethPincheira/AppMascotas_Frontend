import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UsersService } from '../../../../core/services/users.service';

@Component({
  selector: 'app-register-page',
  imports: [FormsModule],
  templateUrl: './register-page.component.html',
  styleUrl: './register-page.component.css'
})
export class RegisterPageComponent {

  email: string = '';
  password: string = '';
  nombre: string = '';
  comuna: string = '';
  ciudad: string = '';

  respuesta: any;

  constructor(private usersService: UsersService) { }

  async register() {
    const register = {
      email: this.email,
      password: this.password,
      nombre: this.nombre,
      comuna: this.comuna,
      ciudad: this.ciudad
    };


    console.log(register, 'usuario registrado');

    this.respuesta = await this.usersService.register(this.email, this.password, this.nombre, this.comuna, this.ciudad);

    console.log(this.respuesta, 'respuesta del servidor');
  }





}

/*
******************


email, password, nombre, comuna, ciudad


import { Component } from '@angular/core';
import { CardMascotaComponent } from '../../../../shared/molecules/card-mascota/card-mascota.component';
import { CommonModule } from '@angular/common';
import { Mascota } from '../../../../shared/models/mascota.model';
import { MascotaService } from '../../../../core/services/mascota.service';


@Component({
  selector: 'app-pets-page',
  imports: [CommonModule, CardMascotaComponent],
  templateUrl: './pets-page.component.html',
  styleUrl: './pets-page.component.css'
})
export class PetsPageComponent {

  trackById(index: number, mascota: Mascota) {
    return mascota.id;
  }

  mascotas: Mascota[] = [];

  imagenUrl: string = '';

  constructor(private mascotaService: MascotaService) { }

  async ngOnInit() {


    this.mascotas = [...await this.mascotaService.getMascotas()];



    console.log(this.mascotas, 'mascotas');
  }



}


*/