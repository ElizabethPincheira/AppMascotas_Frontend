import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Meta } from '@angular/platform-browser';
import Swal from 'sweetalert2';
import { Router, RouterLink } from '@angular/router';
import { UsersService } from '../../../core/services/users.service';
import { UbicacionesService } from '../../../core/services/ubicaciones.service';
import { SeoService } from '../../../core/services/seo.service';


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
  confirmPassword: string = '';
  nombre: string = '';
  aceptaTerminos = false;
  regiones: string[] = [];
  provincias: string[] = [];
  comunas: string[] = [];

  respuesta: any;
  registroExitoso = false;
  emailRegistrado = '';
  codigoVerificacion = '';
  verificandoCodigo = false;
  reenviandoCodigo = false;

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
    private router: Router,
    private seoService: SeoService,
    private metaService: Meta,
  ) { }


  async ngOnInit() {
    this.seoService.setPage(
      'Crear cuenta | Circulo Animal',
      'Crea tu cuenta en Circulo Animal para publicar casos, gestionar mascotas y participar en la comunidad.',
    );
    this.metaService.updateTag({ name: 'robots', content: 'noindex, nofollow' });

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
      this.codigoVerificacion = '';
      this.registroExitoso = true;
    } finally {
      this.enviandoFormulario = false;
    }
  }

  async confirmarCodigo(): Promise<void> {
    if (!this.emailRegistrado || !this.codigoNormalizado) {
      return;
    }

    this.verificandoCodigo = true;

    try {
      const response = await this.usersService.verifyEmailCode(
        this.emailRegistrado,
        this.codigoNormalizado,
      );

      await Swal.fire({
        icon: 'success',
        title: 'Correo verificado',
        text: response?.message || 'Tu cuenta ya quedó verificada.',
        confirmButtonText: 'Ir al login',
      });

      await this.router.navigate(['/login']);
    } catch (error: any) {
      await Swal.fire({
        icon: 'error',
        title: 'Codigo invalido',
        text: error?.response?.data?.message || 'No pudimos verificar tu cuenta con ese codigo.',
        confirmButtonText: 'Intentar nuevamente',
      });
    } finally {
      this.verificandoCodigo = false;
    }
  }

  async reenviarCodigo(): Promise<void> {
    if (!this.emailRegistrado) {
      return;
    }

    this.reenviandoCodigo = true;

    try {
      const response = await this.usersService.resendVerificationEmail(this.emailRegistrado);

      await Swal.fire({
        icon: 'success',
        title: 'Codigo reenviado',
        text: response?.message || 'Si tu cuenta sigue pendiente, enviaremos un nuevo codigo.',
        confirmButtonText: 'Continuar',
      });
    } catch (error: any) {
      await Swal.fire({
        icon: 'error',
        title: 'No se pudo reenviar',
        text: error?.response?.data?.message || 'Ocurrió un problema al reenviar el codigo.',
        confirmButtonText: 'Entendido',
      });
    } finally {
      this.reenviandoCodigo = false;
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
      this.confirmPassword.trim() &&
      this.password === this.confirmPassword &&
      this.regionSeleccionada &&
      this.provinciaSeleccionada &&
      this.comunaSeleccionada &&
      this.aceptaTerminos
    );
  }

  get contraseniasCoinciden(): boolean {
    return this.password === this.confirmPassword;
  }

  get codigoNormalizado(): string {
    return this.codigoVerificacion.replace(/\s+/g, '').trim();
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
