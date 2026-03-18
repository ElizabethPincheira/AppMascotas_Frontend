import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UsersService } from '../../../../core/services/users.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { UbicacionesService } from '../../../../core/services/ubicaciones.service';

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
  regiones: any[] = [];
  provincias: any[] = [];
  comunas: any[] = [];

  respuesta: any;

  regionSeleccionada: string | null = null;
  provinciaSeleccionada: string | null = null;
  comunaSeleccionada: string | null = null;


  constructor(
    private usersService: UsersService,
    private ubicacionesService: UbicacionesService,
    private router: Router
  ) { }


  async ngOnInit() {
    this.regiones = await this.ubicacionesService.getUbicaciones();
    console.log(this.regiones, 'regiones obtenidas');
  }

  async register() {
    this.respuesta = await this.usersService.register(
      this.email,
      this.password,
      this.nombre,
      this.regionSeleccionada,
      this.provinciaSeleccionada,
      this.comunaSeleccionada,
    );

    console.log(this.respuesta, 'respuesta del servidor');
    Swal.close();
  }

  async onRegionChange() {}

  async onProvinciaChange() {}

  async onComunaChange() {}










}


