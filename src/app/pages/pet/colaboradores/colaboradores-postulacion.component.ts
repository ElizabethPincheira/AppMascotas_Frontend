import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import axios from 'axios';
import { AuthService } from '../../../core/services/auth.service';
import { UbicacionesService } from '../../../core/services/ubicaciones.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-colaboradores-postulacion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './colaboradores-postulacion.component.html',
  styleUrls: ['./colaboradores.component.css', './colaboradores-postulacion.component.css']
})
export class ColaboradoresPostulacionComponent implements OnInit, OnDestroy {
  estaLogueado = false;
  selectedArea: string | null = null;
  private destroy$ = new Subject<void>();

  // Form properties
  nombre = '';
  email = '';
  telefono = '';
  region = '';
  provincia = '';
  comuna = '';
  tiposSeleccionados: string[] = [];
  descripcion = '';
  enviando = false;
  yaPostulo = false;
  errorEnvio = '';

  // Location loading states
  regiones: string[] = [];
  provincias: string[] = [];
  comunas: string[] = [];
  cargandoProvincias = false;
  cargandoComunas = false;

  // Existing application state
  postulacion: any = null;
  cargandoPostulacion = true;

  readonly tiposColaboracion = [
    { id: 'reparto', label: 'Venta y reparto de alimento' },
    { id: 'veterinario', label: 'Servicios veterinarios' },
    { id: 'buscador', label: 'Búsqueda de mascotas perdidas' },
    { id: 'acogida', label: 'Casa de acogida temporal' }
  ];

  readonly estadoConfig = {
    pendiente: { label: 'Pendiente', class: 'estado-pendiente', icon: 'clock' },
    contactado: { label: 'Contactado', class: 'estado-contactado', icon: 'mail' },
    activo: { label: 'Activo', class: 'estado-activo', icon: 'check' },
    rechazado: { label: 'Rechazado', class: 'estado-rechazado', icon: 'x' }
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private ubicacionesService: UbicacionesService,
    private authService: AuthService
  ) { }

  async ngOnInit() {
    this.estaLogueado = this.authService.isLogged();

    this.authService.user$
      .pipe(takeUntil(this.destroy$))
      .subscribe(usuario => {
        const nuevoEstado = !!usuario || this.authService.isLogged();
        const cambioEstado = this.estaLogueado !== nuevoEstado;
        this.estaLogueado = nuevoEstado;

        if (cambioEstado && this.estaLogueado) {
          this.cargandoPostulacion = true;
          void this.cargarPostulacionExistente();
        }

        if (cambioEstado && !this.estaLogueado) {
          this.cargandoPostulacion = false;
          this.postulacion = null;
          this.yaPostulo = false;
        }
      });

    this.route.queryParamMap
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const area = params.get('area');
        if (!area) return;
        this.preSeleccionarArea(area);
      });

    try {
      this.regiones = await this.ubicacionesService.getUbicaciones();
    } catch (error) {
      console.error('Error loading regions:', error);
    }

    if (this.estaLogueado) {
      await this.cargarPostulacionExistente();
    } else {
      this.cargandoPostulacion = false;
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private preSeleccionarArea(areaId: string): void {
    const existe = this.tiposColaboracion.some(tipo => tipo.id === areaId);
    if (!existe) return;

    this.selectedArea = areaId;
    this.tiposSeleccionados = [areaId];
  }

  async cargarPostulacionExistente(): Promise<void> {
    try {
      const response = await axios.get(`${environment.apiUrl}colaboradores/mi-postulacion`);
      if (response.data) {
        this.postulacion = response.data;
        this.yaPostulo = true;
      }
    } catch (error: any) {
      if (error.response?.status !== 404) {
        console.error('Error loading existing application:', error);
      }
    } finally {
      this.cargandoPostulacion = false;
    }
  }

  async onRegionChange(): Promise<void> {
    this.provincia = '';
    this.comuna = '';
    this.provincias = [];
    this.comunas = [];

    if (!this.region) return;

    this.cargandoProvincias = true;
    try {
      this.provincias = await this.ubicacionesService.getUbicaciones(this.region);
    } catch (error) {
      console.error('Error loading provinces:', error);
    } finally {
      this.cargandoProvincias = false;
    }
  }

  async onProvinciaChange(): Promise<void> {
    this.comuna = '';
    this.comunas = [];

    if (!this.region || !this.provincia) return;

    this.cargandoComunas = true;
    try {
      this.comunas = await this.ubicacionesService.getUbicaciones(this.region, this.provincia);
    } catch (error) {
      console.error('Error loading communes:', error);
    } finally {
      this.cargandoComunas = false;
    }
  }

  toggleTipo(tipoId: string): void {
    const index = this.tiposSeleccionados.indexOf(tipoId);
    if (index > -1) {
      this.tiposSeleccionados.splice(index, 1);
    } else {
      this.tiposSeleccionados.push(tipoId);
    }
  }

  async enviarPostulacion(): Promise<void> {
    if (!this.nombre || !this.email || !this.telefono || !this.region || !this.provincia || !this.comuna) {
      this.errorEnvio = 'Por favor completa todos los campos obligatorios.';
      return;
    }

    if (this.tiposSeleccionados.length === 0) {
      this.errorEnvio = 'Por favor selecciona al menos un tipo de colaboración.';
      return;
    }

    this.errorEnvio = '';
    this.enviando = true;

    try {
      const payload = {
        nombre: this.nombre,
        email: this.email,
        telefono: this.telefono,
        region: this.region,
        provincia: this.provincia,
        comuna: this.comuna,
        tipos: this.tiposSeleccionados,
        descripcion: this.descripcion
      };

      await axios.post(`${environment.apiUrl}colaboradores`, payload);
      this.yaPostulo = true;
    } catch (error) {
      console.error('Error enviando postulación:', error);
      this.errorEnvio = 'Hubo un error al enviar tu postulación. Por favor intenta de nuevo.';
    } finally {
      this.enviando = false;
    }
  }

  irARegistro(): void {
    this.router.navigate(['/register'], { queryParams: { returnUrl: '/colaboradores/postulacion' } });
  }

  irALogin(): void {
    this.router.navigate(['/login'], { queryParams: { returnUrl: '/colaboradores/postulacion' } });
  }

  volverAColaboradores(): void {
    this.router.navigate(['/colaboradores']);
  }

  volverAlInicio(): void {
    this.router.navigate(['/']);
  }

  isCamposBasicosCompletos(): boolean {
    return !!this.nombre && !!this.email && !!this.telefono;
  }

  isCamposUbicacionCompletos(): boolean {
    return !!this.region && !!this.provincia && !!this.comuna;
  }

  isFormularioCompleto(): boolean {
    return this.isCamposBasicosCompletos() && this.isCamposUbicacionCompletos() && this.tiposSeleccionados.length > 0;
  }

  get estadoPostulacion(): any {
    if (!this.postulacion) return null;
    return this.estadoConfig[this.postulacion.estado as keyof typeof this.estadoConfig];
  }

  get fechaFormateada(): string {
    if (!this.postulacion?.fechaPostulacion) return '';
    const date = new Date(this.postulacion.fechaPostulacion);
    return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  obtenerLabelTipo(tipoId: string): string {
    return this.tiposColaboracion.find(t => t.id === tipoId)?.label || tipoId;
  }
}
