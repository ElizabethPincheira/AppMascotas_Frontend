import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { ImagenesService } from '../../../core/services/imagenes.service';
import { MascotaService } from '../../../core/services/mascota.service';
import { Mascota } from '../../../shared/models/mascota.model';

@Component({
  selector: 'app-publicar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './publicar.component.html',
  styleUrls: ['./publicar.component.css']
})
export class PublicarComponent {
  private readonly mascotaService = inject(MascotaService);
  private readonly imagenesService = inject(ImagenesService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  mascotaId: string | null = null;
  modoEdicion = false;

  nombre = '';
  especie = '';
  raza = '';
  estado = 'Extraviado';
  fechaNacimiento = '';
  perdidoDesde = '';
  latitud: number | null = null;
  longitud: number | null = null;
  direccionGps = '';
  caracteristicasAdicionales = '';
  contacto = '';
  modoUbicacion: 'mapa' | 'gps' = 'mapa';
  ubicacionGpsCargando = false;
  ubicacionGpsLista = false;
  resolviendoDireccionGps = false;

  enviandoFormulario = false;

  imagePreviews: string[] = [];
  imagePayloads: string[] = [];

  readonly estados = [
    'Extraviado',
    'Robado',
    'Encontrado',
    'Busca hogar',
    'Recuperado'
  ];

  readonly especies = [
    'Perro',
    'Gato',
    'Ave',
    'Conejo',
    'Otra'
  ];

  readonly mapWidth = 960;
  readonly mapHeight = 540;
  readonly tileSize = 256;
  mapCenterLat = -35.6751;
  mapCenterLng = -71.543;
  mapZoom = 5;

  async ngOnInit(): Promise<void> {
    this.mascotaId = this.route.snapshot.paramMap.get('id');
    this.modoEdicion = !!this.mascotaId;

    if (this.modoEdicion && this.mascotaId) {
      await this.cargarMascotaParaEditar(this.mascotaId);
    }
  }

  get formularioCompleto(): boolean {
    const tieneUbicacionGps = this.latitud !== null && this.longitud !== null;

    return !!(
      this.nombre.trim() &&
      this.especie.trim() &&
      this.raza.trim() &&
      this.estado.trim() &&
      this.fechaNacimiento &&
      this.contacto.trim() &&
      tieneUbicacionGps
    );
  }

  get mapaUrl(): string {
    return '';
  }

  get mapTiles(): Array<{ src: string; left: number; top: number }> {
    const centerWorld = this.project(this.mapCenterLat, this.mapCenterLng);
    const startX = centerWorld.x - this.mapWidth / 2;
    const startY = centerWorld.y - this.mapHeight / 2;
    const endX = centerWorld.x + this.mapWidth / 2;
    const endY = centerWorld.y + this.mapHeight / 2;
    const scale = this.tileSize * Math.pow(2, this.mapZoom);
    const maxTileIndex = Math.pow(2, this.mapZoom);

    const tileStartX = Math.floor(startX / this.tileSize);
    const tileEndX = Math.floor(endX / this.tileSize);
    const tileStartY = Math.floor(startY / this.tileSize);
    const tileEndY = Math.floor(endY / this.tileSize);
    const tiles: Array<{ src: string; left: number; top: number }> = [];

    for (let tileX = tileStartX; tileX <= tileEndX; tileX += 1) {
      for (let tileY = tileStartY; tileY <= tileEndY; tileY += 1) {
        if (tileY < 0 || tileY >= maxTileIndex) {
          continue;
        }

        const wrappedTileX = ((tileX % maxTileIndex) + maxTileIndex) % maxTileIndex;

        tiles.push({
          src: `https://tile.openstreetmap.org/${this.mapZoom}/${wrappedTileX}/${tileY}.png`,
          left: tileX * this.tileSize - startX,
          top: tileY * this.tileSize - startY,
        });
      }
    }

    return tiles;
  }

  seleccionarModoUbicacion(modo: 'mapa' | 'gps'): void {
    this.modoUbicacion = modo;

    if (modo === 'mapa') {
      this.ubicacionGpsLista = this.latitud !== null && this.longitud !== null;
      if (!this.direccionGps && this.ubicacionGpsLista) {
        this.direccionGps = 'Punto marcado en el mapa';
      }
      return;
    }

    if (modo === 'gps') {
      this.latitud = null;
      this.longitud = null;
      this.direccionGps = '';
      this.ubicacionGpsLista = false;
    }
  }

  async seleccionarPuntoMapa(event: MouseEvent): Promise<void> {
    const mapa = event.currentTarget as HTMLElement | null;

    if (!mapa) {
      return;
    }

    const rect = mapa.getBoundingClientRect();
    const relativeX = (event.clientX - rect.left) / rect.width;
    const relativeY = (event.clientY - rect.top) / rect.height;
    const pixelX = relativeX * this.mapWidth;
    const pixelY = relativeY * this.mapHeight;
    const { latitud, longitud } = this.pixelToLatLng(pixelX, pixelY);

    this.latitud = Number(latitud.toFixed(6));
    this.longitud = Number(longitud.toFixed(6));
    this.ubicacionGpsLista = true;
    this.modoUbicacion = 'mapa';
    this.direccionGps = await this.obtenerDireccionDesdeCoordenadas(this.latitud, this.longitud);
  }

  get markerLeft(): string {
    if (this.latitud === null || this.longitud === null) {
      return '50%';
    }

    const { x } = this.latLngToPixel(this.latitud, this.longitud);
    const ratio = x / this.mapWidth;

    return `${Math.min(Math.max(ratio * 100, 0), 100)}%`;
  }

  get markerTop(): string {
    if (this.latitud === null || this.longitud === null) {
      return '50%';
    }

    const { y } = this.latLngToPixel(this.latitud, this.longitud);
    const ratio = y / this.mapHeight;

    return `${Math.min(Math.max(ratio * 100, 0), 100)}%`;
  }

  async usarUbicacionActual(): Promise<void> {
    if (this.ubicacionGpsCargando) {
      return;
    }

    const position = await this.obtenerPosicionActual();

    if (!position) {
      return;
    }

    this.ubicacionGpsCargando = true;

    try {
      this.latitud = Number(position.coords.latitude.toFixed(6));
      this.longitud = Number(position.coords.longitude.toFixed(6));
      this.ubicacionGpsLista = true;
      this.direccionGps = await this.obtenerDireccionDesdeCoordenadas(this.latitud, this.longitud);
    } finally {
      this.ubicacionGpsCargando = false;
    }
  }

  async centrarMapaEnUbicacionActual(): Promise<void> {
    if (this.ubicacionGpsCargando) {
      return;
    }

    const position = await this.obtenerPosicionActual();

    if (!position) {
      return;
    }

    this.ubicacionGpsCargando = true;

    try {
      this.latitud = Number(position.coords.latitude.toFixed(6));
      this.longitud = Number(position.coords.longitude.toFixed(6));
      this.mapCenterLat = this.latitud;
      this.mapCenterLng = this.longitud;
      this.mapZoom = 14;
      this.ubicacionGpsLista = true;
      this.direccionGps = await this.obtenerDireccionDesdeCoordenadas(this.latitud, this.longitud);
      this.modoUbicacion = 'mapa';
    } finally {
      this.ubicacionGpsCargando = false;
    }
  }

  zoomMapa(delta: number): void {
    this.mapZoom = Math.min(Math.max(this.mapZoom + delta, 4), 17);
  }

  private async obtenerPosicionActual(): Promise<GeolocationPosition | null> {
    if (!navigator.geolocation) {
      await Swal.fire({
        icon: 'info',
        title: 'GPS no disponible',
        text: 'Tu navegador no permite obtener la ubicación actual.'
      });
      return null;
    }

    try {
      return await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 12000,
          maximumAge: 0
        });
      });
    } catch (error) {
      await Swal.fire({
        icon: 'warning',
        title: 'No pudimos obtener tu ubicación',
        text: 'Puedes intentarlo nuevamente o marcar el punto directamente en el mapa.'
      });

      console.error(error);
      return null;
    }
  }

  async onImagesSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const files = input.files;

    this.imagePreviews = [];
    this.imagePayloads = [];

    if (!files?.length) {
      return;
    }

    const selectedFiles = Array.from(files).slice(0, 5);
    const results = await Promise.all(selectedFiles.map((file) => this.readFileAsPreview(file)));

    this.imagePreviews = results;
    this.imagePayloads = await this.imagenesService.filesToBase64(selectedFiles);
  }

  async submit(): Promise<void> {
    if (!this.formularioCompleto || this.enviandoFormulario) {
      return;
    }

    this.enviandoFormulario = true;

    Swal.fire({
      title: 'Inscribiendo mascota...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });

    try {
      const payload = {
        nombre: this.nombre.trim(),
        especie: this.especie.trim().toLowerCase(),
        raza: this.raza.trim(),
        estado: this.estado,
        fechaNacimiento: this.fechaNacimiento,
        perdidoDesde: this.perdidoDesde || undefined,
        latitud: this.latitud ?? undefined,
        longitud: this.longitud ?? undefined,
        caracteristicasAdicionales: this.caracteristicasAdicionales.trim() || undefined,
        contacto: this.contacto.trim()
      };

      const response = this.modoEdicion && this.mascotaId
        ? await this.mascotaService.updateMascota(this.mascotaId, payload)
        : await this.mascotaService.createMascota(payload);

      const mascotaId = this.mascotaId ?? response?.mascotaId ?? response?._id ?? response?.id;

      if (mascotaId && this.imagePayloads.length) {
        await this.imagenesService.cargarImagenesMascota(mascotaId, this.imagePayloads);
      }

      Swal.close();

      await Swal.fire({
        icon: 'success',
        title: this.modoEdicion ? 'Mascota actualizada' : 'Mascota inscrita',
        text: this.modoEdicion
          ? 'La información se actualizó correctamente.'
          : 'Tu publicación ya quedó registrada correctamente.'
      });

      await this.router.navigate(['/mis-mascotas']);
    } catch (error) {
      Swal.close();
      await Swal.fire({
        icon: 'error',
        title: 'No se pudo inscribir',
        text: 'Revisa los datos e intenta nuevamente.'
      });
      console.error(error);
    } finally {
      this.enviandoFormulario = false;
    }
  }

  private readFileAsPreview(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  private async cargarMascotaParaEditar(id: string): Promise<void> {
    const mascota = await this.mascotaService.getMascotaById(id);

    if (!mascota) {
      return;
    }

    await this.cargarFormularioDesdeMascota(mascota);
  }

  private async cargarFormularioDesdeMascota(mascota: Mascota): Promise<void> {
    this.nombre = mascota.nombre ?? '';
    this.especie = mascota.especie ? this.capitalize(mascota.especie) : '';
    this.raza = mascota.raza ?? '';
    this.estado = mascota.estado ?? 'Extraviado';
    this.fechaNacimiento = this.toInputDate(mascota.fechaNacimiento);
    this.perdidoDesde = this.toInputDate((mascota as any).perdidoDesde);
    this.latitud = typeof mascota.latitud === 'number' ? mascota.latitud : null;
    this.longitud = typeof mascota.longitud === 'number' ? mascota.longitud : null;
    this.modoUbicacion = 'mapa';
    this.ubicacionGpsLista = this.latitud !== null && this.longitud !== null;
    this.direccionGps = this.ubicacionGpsLista ? 'Punto guardado en el mapa' : '';
    this.caracteristicasAdicionales = mascota.caracteristicasAdicionales ?? '';
    this.contacto = mascota.contacto ?? '';
    this.imagePreviews = (mascota.imagenes ?? []).map((imagen) =>
      imagen.startsWith('data:') ? imagen : `data:image/jpeg;base64,${imagen}`
    );
  }

  private toInputDate(value?: string | Date): string {
    if (!value) {
      return '';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return '';
    }

    return date.toISOString().slice(0, 10);
  }

  private capitalize(value: string): string {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  private latLngToPixel(latitud: number, longitud: number): { x: number; y: number } {
    const center = this.project(this.mapCenterLat, this.mapCenterLng);
    const point = this.project(latitud, longitud);

    return {
      x: point.x - center.x + this.mapWidth / 2,
      y: point.y - center.y + this.mapHeight / 2,
    };
  }

  private pixelToLatLng(x: number, y: number): { latitud: number; longitud: number } {
    const center = this.project(this.mapCenterLat, this.mapCenterLng);
    const worldX = center.x - this.mapWidth / 2 + x;
    const worldY = center.y - this.mapHeight / 2 + y;

    return this.unproject(worldX, worldY);
  }

  private project(latitud: number, longitud: number): { x: number; y: number } {
    const scale = 256 * Math.pow(2, this.mapZoom);
    const sinLat = Math.sin((latitud * Math.PI) / 180);

    return {
      x: ((longitud + 180) / 360) * scale,
      y: (0.5 - Math.log((1 + sinLat) / (1 - sinLat)) / (4 * Math.PI)) * scale,
    };
  }

  private unproject(x: number, y: number): { latitud: number; longitud: number } {
    const scale = 256 * Math.pow(2, this.mapZoom);
    const longitud = (x / scale) * 360 - 180;
    const mercatorY = 0.5 - y / scale;
    const latitud = 90 - (360 * Math.atan(Math.exp(-mercatorY * 2 * Math.PI))) / Math.PI;

    return {
      latitud,
      longitud,
    };
  }

  private async obtenerDireccionDesdeCoordenadas(latitud: number, longitud: number): Promise<string> {
    this.resolviendoDireccionGps = true;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitud}&lon=${longitud}&accept-language=es`,
      );

      if (!response.ok) {
        return this.formatearCoordenadas(latitud, longitud);
      }

      const data = await response.json();
      const address = data?.address ?? {};
      const segmentos = [
        address.road,
        address.house_number,
        address.suburb,
        address.city || address.town || address.village,
        address.state,
      ]
        .filter(Boolean)
        .join(', ');

      return segmentos || data?.display_name || this.formatearCoordenadas(latitud, longitud);
    } catch {
      return this.formatearCoordenadas(latitud, longitud);
    } finally {
      this.resolviendoDireccionGps = false;
    }
  }

  private formatearCoordenadas(latitud: number, longitud: number): string {
    return `Ubicación detectada (${latitud}, ${longitud})`;
  }
}
