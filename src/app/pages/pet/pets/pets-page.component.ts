import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { Mascota } from '../../../shared/models/mascota.model';
import { MascotaService } from '../../../core/services/mascota.service';
import { SeoService } from '../../../core/services/seo.service';
import { CardMascotaComponent } from '../../../shared/molecules/card-mascota/card-mascota.component';
import { SkeletonCardComponent } from '../../../shared/atoms/skeleton-card/skeleton-card.component';

@Component({
  selector: 'app-pets-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, CardMascotaComponent, SkeletonCardComponent],
  templateUrl: './pets-page.component.html',
  styleUrls: ['./pets-page.component.css']
})
export class PetsPageComponent {
  trackById(index: number, mascota: Mascota) {
    return mascota._id ?? mascota.id ?? index;
  }

  mascotas: Mascota[] = [];
  cargando = true;
  ubicacionUsuarioDisponible = false;
  explorandoInicio = false;
  filtroModoInicio: 'todos' | 'perdidos' | 'adopcion' | 'calle' = 'todos';
  filtroEspecie: 'Todas' | 'Perro' | 'Gato' | 'Otro' = 'Todas';
  filtroTexto = '';
  readonly estadosPerdidos = ['Robado', 'Extraviado', 'Encontrado', 'Recuperado'];
  readonly estadosAdopcion = ['Busca hogar'];
  readonly estadosCalle = ['Situacion de calle'];
  readonly especiesFiltro: Array<'Todas' | 'Perro' | 'Gato' | 'Otro'> = ['Todas', 'Perro', 'Gato', 'Otro'];
  readonly modosInicio = [
    { value: 'todos', label: 'Todos' },
    { value: 'perdidos', label: 'Perdidos' },
    { value: 'adopcion', label: 'Adopcion' },
    { value: 'calle', label: 'En calle' },
  ] as const;

  constructor(
    private mascotaService: MascotaService,
    private seoService: SeoService,
    private authService: AuthService,
  ) { }

  async ngOnInit() {
    try {
      this.seoService.setPage(
        'Círculo Animal — Mascotas perdidas y adopción en Chile',
        'Encuentra mascotas perdidas, casos de adopción y animales en situación de calle en Chile a través de la red de ayuda de Círculo Animal.',
      );

      const posicion = await this.obtenerUbicacionUsuario();
      this.mascotas = [
        ...await this.mascotaService.getMascotas(
          posicion
            ? {
                latitud: posicion.latitude,
                longitud: posicion.longitude,
              }
            : undefined,
        ),
      ];
    } finally {
      this.cargando = false;
    }
  }

  get mascotasPerdidasRecientes(): Mascota[] {
    return this.mascotas
      .filter((mascota) => this.estadosPerdidos.includes(mascota.estado))
      .slice(0, 4);
  }

  get mascotasEnAdopcion(): Mascota[] {
    return this.mascotas
      .filter((mascota) => this.estadosAdopcion.includes(mascota.estado))
      .slice(0, 4);
  }

  get mascotasEnCalle(): Mascota[] {
    return this.mascotas
      .filter((mascota) => this.estadosCalle.includes(mascota.estado))
      .slice(0, 4);
  }

  get mascotasInicioFiltradas(): Mascota[] {
    const allowedStates = this.filtroModoInicio === 'perdidos'
      ? this.estadosPerdidos
      : this.filtroModoInicio === 'adopcion'
        ? this.estadosAdopcion
        : this.filtroModoInicio === 'calle'
          ? this.estadosCalle
          : [...this.estadosPerdidos, ...this.estadosAdopcion, ...this.estadosCalle];

    const textoBuscado = this.normalizarTexto(this.filtroTexto);

    return this.mascotas
      .filter((mascota) => allowedStates.includes(mascota.estado))
      .filter((mascota) => {
        const especieMascota = this.normalizarTexto(mascota.especie);
        const coincideEspecie = this.filtroEspecie === 'Todas'
          ? true
          : this.filtroEspecie === 'Otro'
            ? !!especieMascota && !['perro', 'gato'].includes(especieMascota)
            : especieMascota === this.normalizarTexto(this.filtroEspecie);

        const coincideTexto = !textoBuscado || [
          mascota.nombre,
          mascota.raza,
          mascota.descripcion,
          mascota.comunaPerdida,
          mascota.regionPerdida,
        ].some((campo) => this.normalizarTexto(campo).includes(textoBuscado));

        return coincideEspecie && coincideTexto;
      })
      .sort((a, b) => {
        const dateA = new Date(a.createdAt ?? 0).getTime();
        const dateB = new Date(b.createdAt ?? 0).getTime();
        return dateB - dateA;
      });
  }

  get mascotasInicioVisibles(): Mascota[] {
    return this.mascotasInicioFiltradas;
  }

  get hayFiltrosInicioActivos(): boolean {
    return this.explorandoInicio;
  }

  get mostrarVistaCurada(): boolean {
    return !this.explorandoInicio;
  }

  get resultadosInicioTexto(): string {
    const total = this.mascotasInicioFiltradas.length;
    return `${total} caso${total === 1 ? '' : 's'} encontrado${total === 1 ? '' : 's'}`;
  }

  get inicioFiltrosTitulo(): string {
    if (this.filtroModoInicio === 'perdidos') {
      return 'Casos perdidos y encontrados';
    }

    if (this.filtroModoInicio === 'adopcion') {
      return 'Mascotas en adopcion';
    }

    if (this.filtroModoInicio === 'calle') {
      return 'Animales en situacion de calle';
    }

    return 'Explora casos desde el inicio';
  }

  get inicioFiltrosDescripcion(): string {
    if (this.filtroModoInicio === 'perdidos') {
      return 'Filtra reportes activos para apoyar reencuentros en tu comunidad.';
    }

    if (this.filtroModoInicio === 'adopcion') {
      return 'Descubre companeros que hoy buscan un nuevo hogar.';
    }

    if (this.filtroModoInicio === 'calle') {
      return 'Revisa casos urgentes de animales que necesitan ayuda o refugio.';
    }

    return 'Usa estos filtros para encontrar rapidamente el tipo de caso que quieres revisar.';
  }

  setFiltroModoInicio(modo: 'todos' | 'perdidos' | 'adopcion' | 'calle'): void {
    this.filtroModoInicio = modo;
    this.explorandoInicio = true;
  }

  activarExploracionInicio(): void {
    this.explorandoInicio = true;
  }

  limpiarFiltrosInicio(): void {
    this.explorandoInicio = false;
    this.filtroModoInicio = 'todos';
    this.filtroEspecie = 'Todas';
    this.filtroTexto = '';
  }

  hasAnySectionData(): boolean {
    return this.mascotasPerdidasRecientes.length > 0 || this.mascotasEnAdopcion.length > 0 || this.mascotasEnCalle.length > 0;
  }

  get totalMascotasVisibles(): number {
    return this.mascotas.length;
  }

  get totalCasosActivos(): number {
    return this.mascotas.filter((mascota) =>
      ['Robado', 'Extraviado', 'Encontrado', 'Busca hogar', 'Situacion de calle'].includes(mascota.estado)
    ).length;
  }

  get rutaAgregarMascota(): string {
    return this.authService.isLogged() ? '/publicar' : '/login';
  }

  private normalizarTexto(value?: string | null): string {
    return (value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  private async obtenerUbicacionUsuario(): Promise<{ latitude: number; longitude: number } | null> {
    if (!navigator.geolocation) {
      return null;
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 8000,
          maximumAge: 300000,
        });
      });

      this.ubicacionUsuarioDisponible = true;

      return {
        latitude: Number(position.coords.latitude.toFixed(6)),
        longitude: Number(position.coords.longitude.toFixed(6)),
      };
    } catch {
      this.ubicacionUsuarioDisponible = false;
      return null;
    }
  }
}
