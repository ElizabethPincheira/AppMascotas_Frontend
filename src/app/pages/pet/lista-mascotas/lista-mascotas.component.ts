import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { MascotaService } from '../../../core/services/mascota.service';
import { SeoService } from '../../../core/services/seo.service';
import { UbicacionesService } from '../../../core/services/ubicaciones.service';
import { CardMascotaComponent } from '../../../shared/molecules/card-mascota/card-mascota.component';
import { Mascota } from '../../../shared/models/mascota.model';

declare const google: any;

@Component({
  selector: 'app-lista-mascotas',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, CardMascotaComponent],
  templateUrl: './lista-mascotas.component.html',
  styleUrls: ['./lista-mascotas.component.css']
})
export class ListaMascotasComponent implements AfterViewInit {
  @ViewChild('petMapContainer') petMapContainer?: ElementRef<HTMLDivElement>;

  mascotas: Mascota[] = [];
  regiones: string[] = [];
  modo: 'perdidos' | 'adopcion' | 'calle' = 'perdidos';
  vistaActiva: 'lista' | 'mapa' = 'lista';
  ubicacionUsuarioDisponible = false;
  filtrosMobileAbiertos = false;
  filtroEspecie: 'Todas' | 'Perro' | 'Gato' | 'Otro' = 'Todas';
  filtroRegion = '';
  filtroTexto = '';
  googleMapsDisponible = false;
  googleMapsError = '';
  mapCenter = { lat: -33.4489, lng: -70.6693 };
  mapZoom = 11;
  readonly estadosPerdidos = ['Robado', 'Extraviado', 'Encontrado', 'Recuperado'];
  readonly estadosAdopcion = ['Busca hogar'];
  readonly estadosCalle = ['Situacion de calle'];
  readonly especiesFiltro: Array<'Todas' | 'Perro' | 'Gato' | 'Otro'> = ['Todas', 'Perro', 'Gato', 'Otro'];
  private readonly googleMapsApiKey = environment.googleMapsApiKey;
  private googleMap?: any;
  private googleInfoWindow?: any;
  private googleMarkers: any[] = [];

  constructor(
    private mascotaService: MascotaService,
    private seoService: SeoService,
    private ubicacionesService: UbicacionesService,
    private route: ActivatedRoute,
  ) {}

  async ngOnInit() {
    this.modo = this.route.snapshot.data['modo'] ?? 'perdidos';
    this.filtrosMobileAbiertos = !this.isMobileViewport();

    const [posicion] = await Promise.all([
      this.obtenerUbicacionUsuario(),
      this.cargarRegiones(),
    ]);

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

    this.seoService.setPage(this.seoTitle, this.seoDescription);

    if (posicion) {
      this.mapCenter = {
        lat: posicion.latitude,
        lng: posicion.longitude,
      };
      this.mapZoom = 13;
    }

    this.actualizarMarcadoresMapa();
  }

  async ngAfterViewInit(): Promise<void> {
    if (!this.puedeMostrarMapa) {
      return;
    }

    await this.inicializarGoogleMap();
  }

  trackById(index: number, mascota: Mascota) {
    return mascota._id ?? mascota.id ?? index;
  }

  get mascotasBaseFiltradas(): Mascota[] {
    const allowedStates = this.modo === 'adopcion'
      ? this.estadosAdopcion
      : this.modo === 'calle'
        ? this.estadosCalle
        : this.estadosPerdidos;

    return this.mascotas
      .filter((mascota) => allowedStates.includes(mascota.estado))
      .sort((a, b) => {
        const distanceA = typeof a.distanciaKm === 'number' ? a.distanciaKm : Number.POSITIVE_INFINITY;
        const distanceB = typeof b.distanciaKm === 'number' ? b.distanciaKm : Number.POSITIVE_INFINITY;

        if (distanceA !== distanceB) {
          return distanceA - distanceB;
        }

        const dateA = new Date(a.createdAt ?? 0).getTime();
        const dateB = new Date(b.createdAt ?? 0).getTime();
        return dateB - dateA;
      });
  }

  get mascotasFiltradas(): Mascota[] {
    const textoBuscado = this.normalizarTexto(this.filtroTexto);

    return this.mascotasBaseFiltradas.filter((mascota) => {
      const especieMascota = this.normalizarTexto(mascota.especie);
      const regionMascota = this.normalizarTexto(mascota.regionPerdida);
      const coincideEspecie = this.filtroEspecie === 'Todas'
        ? true
        : this.filtroEspecie === 'Otro'
          ? !!especieMascota && !['perro', 'gato'].includes(especieMascota)
          : especieMascota === this.normalizarTexto(this.filtroEspecie);
      const coincideRegion = !this.filtroRegion || regionMascota === this.normalizarTexto(this.filtroRegion);
      const coincideTexto = !textoBuscado || [
        mascota.nombre,
        mascota.raza,
        mascota.descripcion,
      ].some((campo) => this.normalizarTexto(campo).includes(textoBuscado));

      return coincideEspecie && coincideRegion && coincideTexto;
    });
  }

  get resultadosTexto(): string {
    const total = this.mascotasFiltradas.length;
    return `${total} resultado${total === 1 ? '' : 's'}`;
  }

  get puedeMostrarMapa(): boolean {
    return this.modo === 'perdidos' || this.modo === 'adopcion';
  }

  get mascotasConCoordenadas(): Mascota[] {
    return this.mascotasFiltradas.filter((mascota) =>
      typeof mascota.latitud === 'number' &&
      Number.isFinite(mascota.latitud) &&
      typeof mascota.longitud === 'number' &&
      Number.isFinite(mascota.longitud)
    );
  }

  get esMapaFullscreenMobile(): boolean {
    return this.vistaActiva === 'mapa' && this.isMobileViewport();
  }

  get hayFiltrosActivos(): boolean {
    return this.filtroEspecie !== 'Todas' || !!this.filtroRegion || !!this.filtroTexto.trim();
  }

  get pageTitle(): string {
    if (this.modo === 'adopcion') {
      return 'Mascotas En Adopcion';
    }

    if (this.modo === 'calle') {
      return 'Animales En Situacion De Calle';
    }

    return 'Mascotas Perdidas';
  }

  get pageDescription(): string {
    const suffix = this.ubicacionUsuarioDisponible
      ? 'Se ordenan desde las más cercanas a tu ubicación.'
      : 'Si habilitas tu ubicación, las verás desde las más cercanas a las más lejanas.';

    if (this.modo === 'adopcion') {
      return `Explora publicaciones activas de mascotas que buscan una nueva familia. ${suffix}`;
    }

    if (this.modo === 'calle') {
      return `Conoce animales que hoy viven en la calle y que necesitan una familia, refugio o una segunda oportunidad. ${suffix}`;
    }

    return `Revisa reportes recientes para ayudar a encontrar y reencontrar mascotas. ${suffix}`;
  }

  get pageBadge(): string {
    if (this.modo === 'adopcion') {
      return 'Adopcion activa';
    }

    if (this.modo === 'calle') {
      return 'Dar hogar';
    }

    return 'Busqueda comunitaria';
  }

  get seoTitle(): string {
    if (this.modo === 'adopcion') {
      return 'Adopción de mascotas en Chile — Círculo Animal';
    }

    if (this.modo === 'calle') {
      return 'Animales en situación de calle en Chile — Círculo Animal';
    }

    return 'Mascotas perdidas en Chile — Círculo Animal';
  }

  get seoDescription(): string {
    if (this.modo === 'adopcion') {
      return 'Explora mascotas en adopción, encuentra una nueva compañía y conoce publicaciones activas de familias y rescatistas en Chile.';
    }

    if (this.modo === 'calle') {
      return 'Conoce animales en situación de calle, encuentra casos urgentes y descubre cómo ayudar desde Círculo Animal.';
    }

    return 'Revisa reportes recientes de mascotas perdidas, ayuda a reencontrarlas con su familia y filtra casos activos por región.';
  }

  get ctaLink(): string {
    return this.modo === 'calle' ? '/situacion-de-calle/publicar' : '/publicar';
  }

  get ctaLabel(): string {
    return this.modo === 'calle' ? 'Publicar animal en calle' : 'Publicar caso';
  }

  toggleFiltros(): void {
    this.filtrosMobileAbiertos = !this.filtrosMobileAbiertos;
  }

  async cambiarVista(vista: 'lista' | 'mapa'): Promise<void> {
    this.vistaActiva = vista;

    if (vista === 'mapa' && this.puedeMostrarMapa) {
      setTimeout(async () => {
        await this.inicializarGoogleMap();
        this.reajustarMapa();
      }, 0);
    }
  }

  onFiltrosChanged(): void {
    this.actualizarMarcadoresMapa();
  }

  getMarkerImage(mascota: Mascota): string {
    const firstImage = mascota.imagenes?.[0];

    if (!firstImage) {
      return this.getFallbackMapImage(mascota);
    }

    if (firstImage.startsWith('http://') || firstImage.startsWith('https://') || firstImage.startsWith('data:')) {
      return firstImage;
    }

    return `data:image/jpeg;base64,${firstImage}`;
  }

  private async inicializarGoogleMap(): Promise<void> {
    if (!this.petMapContainer?.nativeElement || this.googleMap || !this.puedeMostrarMapa) {
      return;
    }

    if (!this.googleMapsApiKey) {
      this.googleMapsError = 'Agrega tu API key de Google Maps en environment para usar la vista de mapa.';
      return;
    }

    try {
      await this.cargarGoogleMapsScript();

      this.googleMapsDisponible = true;
      this.googleInfoWindow = new google.maps.InfoWindow();
      this.googleMap = new google.maps.Map(this.petMapContainer.nativeElement, {
        center: this.mapCenter,
        zoom: this.mapZoom,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        clickableIcons: false,
        gestureHandling: 'greedy',
      });

      this.actualizarMarcadoresMapa();
    } catch {
      this.googleMapsError = 'No se pudo cargar Google Maps. Revisa la API key o las restricciones del dominio.';
    }
  }

  private async cargarGoogleMapsScript(): Promise<void> {
    if ((window as any).google?.maps) {
      return;
    }

    const existingPromise = (window as any).__googleMapsLoader as Promise<void> | undefined;

    if (existingPromise) {
      await existingPromise;
      return;
    }

    (window as any).__googleMapsLoader = new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${this.googleMapsApiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('No se pudo cargar Google Maps'));
      document.head.appendChild(script);
    });

    await (window as any).__googleMapsLoader;
  }

  private actualizarMarcadoresMapa(): void {
    if (!this.googleMap) {
      return;
    }

    this.googleMarkers.forEach((marker) => marker.setMap(null));
    this.googleMarkers = [];

    const bounds = new google.maps.LatLngBounds();

    this.mascotasConCoordenadas.forEach((mascota) => {
      const marker = new google.maps.Marker({
        position: {
          lat: mascota.latitud,
          lng: mascota.longitud,
        },
        map: this.googleMap,
        title: mascota.nombre,
        icon: this.buildMarkerIcon(mascota.estado),
      });

      marker.addListener('click', () => {
        this.googleInfoWindow?.setContent(this.buildInfoWindowContent(mascota));
        this.googleInfoWindow?.open({
          anchor: marker,
          map: this.googleMap,
        });
      });

      this.googleMarkers.push(marker);
      bounds.extend(marker.getPosition());
    });

    if (this.mascotasConCoordenadas.length === 0) {
      this.googleMap.setCenter(this.mapCenter);
      this.googleMap.setZoom(this.mapZoom);
      return;
    }

    if (this.mascotasConCoordenadas.length === 1) {
      this.googleMap.setCenter(bounds.getCenter());
      this.googleMap.setZoom(Math.max(this.mapZoom, 14));
      return;
    }

    this.googleMap.fitBounds(bounds, 80);
  }

  private reajustarMapa(): void {
    if (!this.googleMap || !(window as any).google?.maps?.event) {
      return;
    }

    google.maps.event.trigger(this.googleMap, 'resize');
    this.actualizarMarcadoresMapa();
  }

  private buildMarkerIcon(estado: string): any {
    const color = this.getMarkerColor(estado);
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="38" height="48" viewBox="0 0 38 48">
        <path fill="${color}" d="M19 0C8.506 0 0 8.506 0 19c0 14.25 19 29 19 29s19-14.75 19-29C38 8.506 29.494 0 19 0z"/>
        <circle cx="19" cy="19" r="8" fill="#fff7ea"/>
      </svg>
    `;

    return {
      url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
      scaledSize: new google.maps.Size(38, 48),
      anchor: new google.maps.Point(19, 48),
    };
  }

  private getMarkerColor(estado: string): string {
    switch (estado) {
      case 'Robado':
        return '#d85b58';
      case 'Extraviado':
        return '#dd9141';
      case 'Busca hogar':
        return '#2d8b57';
      default:
        return '#5d8746';
    }
  }

  private buildInfoWindowContent(mascota: Mascota): string {
    const id = mascota._id ?? mascota.id ?? '';
    const image = this.getMarkerImage(mascota);
    const comuna = mascota.comunaPerdida || mascota.regionPerdida || 'Ubicación no informada';

    return `
      <div style="max-width:220px;font-family:Arial,sans-serif;color:#1f2937;">
        <img src="${image}" alt="${this.escapeHtml(mascota.nombre)}" style="width:100%;height:120px;object-fit:cover;border-radius:12px;margin-bottom:10px;" />
        <strong style="display:block;font-size:1rem;margin-bottom:4px;">${this.escapeHtml(mascota.nombre)}</strong>
        <span style="display:block;color:#4b5563;font-size:0.88rem;margin-bottom:4px;">${this.escapeHtml(mascota.estado)}</span>
        <span style="display:block;color:#6b7280;font-size:0.82rem;margin-bottom:10px;">${this.escapeHtml(comuna)}</span>
        <a href="/mascotas/${id}" style="display:inline-flex;padding:10px 14px;border-radius:999px;background:#315740;color:#fff;text-decoration:none;font-weight:700;">
          Ver detalle
        </a>
      </div>
    `;
  }

  private escapeHtml(value?: string | number | null): string {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
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

  private async cargarRegiones(): Promise<void> {
    try {
      this.regiones = await this.ubicacionesService.getUbicaciones();
    } catch (error) {
      console.error('No se pudieron cargar las regiones para los filtros.', error);
      this.regiones = [];
    }
  }

  private isMobileViewport(): boolean {
    return typeof window !== 'undefined' && window.innerWidth <= 620;
  }

  private getFallbackMapImage(mascota: Mascota): string {
    const initial = (mascota.nombre?.trim()?.charAt(0) || 'M').toUpperCase();
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 160">
        <rect width="240" height="160" rx="20" fill="#eef3e8" />
        <circle cx="120" cy="70" r="36" fill="#ffffff" />
        <text x="120" y="84" text-anchor="middle" font-family="Arial, sans-serif" font-size="34" font-weight="700" fill="#315740">${initial}</text>
        <text x="120" y="130" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="#5b6b61">Circulo Animal</text>
      </svg>
    `;

    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  }

  private normalizarTexto(value?: string | null): string {
    return (value ?? '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }
}
