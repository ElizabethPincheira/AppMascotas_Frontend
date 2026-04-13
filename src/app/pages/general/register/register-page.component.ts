import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { Router, RouterLink } from '@angular/router';
import { UsersService } from '../../../core/services/users.service';
import { UbicacionesService } from '../../../core/services/ubicaciones.service';


@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register-page.component.html',
  styleUrls: ['./register-page.component.css']
})
export class RegisterPageComponent {

  email: string = '';
  password: string = '';
  nombre: string = '';
  regiones: string[] = [];
  provincias: string[] = [];
  comunas: string[] = [];

  respuesta: any;
  registroExitoso = false;
  emailRegistrado = '';

  regionSeleccionada: string = '';
  provinciaSeleccionada: string = '';
  comunaSeleccionada: string = '';
  cargandoRegiones = false;
  cargandoProvincias = false;
  cargandoComunas = false;
  enviandoFormulario = false;


  constructor(
    private usersService: UsersService,
    private ubicacionesService: UbicacionesService,
    private router: Router
  ) { }


  async ngOnInit() {
    await this.cargarRegiones();
  }

  async register() {
    this.enviandoFormulario = true;

    try {
      this.respuesta = await this.usersService.register(
        this.email,
        this.password,
        this.nombre,
        this.regionSeleccionada,
        this.provinciaSeleccionada,
        this.comunaSeleccionada,
      );

      console.log(this.respuesta, 'respuesta del servidor');
      this.emailRegistrado = this.email.trim();
      this.registroExitoso = true;
    } finally {
      this.enviandoFormulario = false;
    }
  }

  async onRegionChange() {
    this.provinciaSeleccionada = '';
    this.comunaSeleccionada = '';
    this.provincias = [];
    this.comunas = [];

    if (!this.regionSeleccionada) {
      return;
    }

    this.cargandoProvincias = true;

    try {
      this.provincias = await this.ubicacionesService.getUbicaciones(this.regionSeleccionada);
    } finally {
      this.cargandoProvincias = false;
    }
  }

  async onProvinciaChange() {
    this.comunaSeleccionada = '';
    this.comunas = [];

    if (!this.regionSeleccionada || !this.provinciaSeleccionada || !this.provincias.includes(this.provinciaSeleccionada)) {
      return;
    }

    this.cargandoComunas = true;

    try {
      this.comunas = await this.ubicacionesService.getUbicaciones(
        this.regionSeleccionada,
        this.provinciaSeleccionada,
      );
    } finally {
      this.cargandoComunas = false;
    }
  }

  async onComunaChange() {}

  get formularioCompleto(): boolean {
    return !!(
      this.nombre.trim() &&
      this.email.trim() &&
      this.password.trim() &&
      this.regionSeleccionada &&
      this.provinciaSeleccionada &&
      this.comunaSeleccionada
    );
  }

  private async cargarRegiones() {
    this.cargandoRegiones = true;

    try {
      this.regiones = await this.ubicacionesService.getUbicaciones();
      console.log(this.regiones, 'regiones obtenidas');
    } finally {
      this.cargandoRegiones = false;
    }
  }
}
