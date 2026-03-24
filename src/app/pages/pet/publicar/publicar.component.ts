import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../../../core/services/auth.service';
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
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  mascotaId: string | null = null;
  modoEdicion = false;
  modoPublicacion: 'normal' | 'calle-publica' = 'normal';

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
  modoContacto: 'mail' | 'telefono' = 'mail';
  modoUbicacion: 'mapa' | 'gps' = 'mapa';
  ubicacionGpsCargando = false;
  ubicacionGpsLista = false;
  resolviendoDireccionGps = false;

  enviandoFormulario = false;

  existingImagePreviews: string[] = [];
  newImagePreviews: string[] = [];
  imagePayloads: string[] = [];
  mensajeErrorImagenes = '';
  eliminandoImagenGuardadaIndex: number | null = null;
  readonly maxImagenes = 5;
  readonly maxTamanoImagenMb = 2;

  readonly estados = [
    'Extraviado',
    'Robado',
    'Encontrado',
    'Busca hogar',
    'Situacion de calle',
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
    this.modoPublicacion = this.route.snapshot.data['modoPublicacion'] ?? 'normal';
    this.mascotaId = this.route.snapshot.paramMap.get('id');
    this.modoEdicion = !!this.mascotaId;

    if (this.esPublicacionCallePublica) {
      this.estado = 'Situacion de calle';
      this.modoContacto = 'telefono';
    }

    if (this.modoEdicion && this.mascotaId) {
      await this.cargarMascotaParaEditar(this.mascotaId);
    }
  }

  get formularioCompleto(): boolean {
    const tieneUbicacionGps = this.latitud !== null && this.longitud !== null;
    const fechasValidas = this.isFechaNacimientoValida() && this.isPerdidoDesdeValida();
    const contactoValido = this.isContactoValido();
    const nombreValido = this.esSituacionDeCalle ? true : !!this.nombre.trim();
    const razaValida = this.esSituacionDeCalle ? true : !!this.raza.trim();

    return !!(
      nombreValido &&
      this.especie.trim() &&
      razaValida &&
      this.estado.trim() &&
      contactoValido &&
      tieneUbicacionGps &&
      fechasValidas
    );
  }

  get maxFechaHoy(): string {
    return new Date().toISOString().slice(0, 10);
  }

  get userEmail(): string {
    return this.authService.getUser()?.email?.trim?.() || '';
  }

  get contactoSeleccionado(): string {
    return this.modoContacto === 'mail' ? this.userEmail : this.contacto.trim();
  }

  get estaAutenticado(): boolean {
    return this.authService.isLogged();
  }

  get esPublicacionCallePublica(): boolean {
    return this.modoPublicacion === 'calle-publica' && !this.modoEdicion;
  }

  get esSituacionDeCalle(): boolean {
    return this.estado === 'Situacion de calle';
  }

  get helperEstado(): string {
    return this.esSituacionDeCalle
      ? 'Usa esta opcion cuando el animal no tiene un dueno identificado y necesita una familia o resguardo.'
      : 'Elige el estado que mejor representa la situacion actual de la mascota.';
  }

  get labelPerdidoDesde(): string {
    return this.esSituacionDeCalle ? 'Vista desde' : 'Perdido desde';
  }

  get labelNombre(): string {
    return this.esSituacionDeCalle ? 'Nombre o referencia visual' : 'Nombre';
  }

  get labelRaza(): string {
    return this.esSituacionDeCalle ? 'Raza o tipo (opcional)' : 'Raza';
  }

  get labelFechaNacimiento(): string {
    return this.esSituacionDeCalle ? 'Fecha de nacimiento aproximada (opcional)' : 'Fecha de nacimiento';
  }

  get placeholderNombre(): string {
    return this.esSituacionDeCalle ? 'Ej: Perrita cafe con pañuelo rojo' : 'Ej: Luna';
  }

  get placeholderRaza(): string {
    return this.esSituacionDeCalle ? 'Ej: Mestizo, tamaño mediano' : 'Ej: Mestiza';
  }

  get labelUbicacion(): string {
    return this.esSituacionDeCalle ? 'Zona donde fue visto' : 'Zona donde fue vista o se perdio';
  }

  get textoMapa(): string {
    return this.esSituacionDeCalle
      ? 'Haz clic sobre el mapa de Chile para marcar el sector donde fue visto y dejar una referencia clara para ayudarlo.'
      : 'Haz clic sobre el mapa de Chile para dejar el punto aproximado y guardar las coordenadas.';
  }

  get textoGps(): string {
    return this.esSituacionDeCalle
      ? 'Usa tu ubicación actual si estás cerca del lugar donde viste al animal y quieres guardar el punto automáticamente.'
      : 'Usa tu ubicación actual si quieres guardar el punto automáticamente desde tu celular o navegador.';
  }

  get estadosDisponibles(): string[] {
    return this.esPublicacionCallePublica ? ['Situacion de calle'] : this.estados;
  }

  get puedeUsarCorreoPerfil(): boolean {
    return this.estaAutenticado && !!this.userEmail;
  }

  get debeMostrarSelectorContacto(): boolean {
    return !this.esPublicacionCallePublica || this.puedeUsarCorreoPerfil;
  }

  get textoHero(): string {
    if (this.esPublicacionCallePublica) {
      return 'Reporta un animal en situación de calle para que la comunidad pueda ayudarle a encontrar hogar.';
    }

    return this.modoEdicion
      ? 'Actualiza la ficha de tu mascota y mantén su publicación siempre al día.'
      : 'Registra a tu mascota y deja lista su publicación para ayudarla a volver o encontrar hogar.';
  }

  get helperContacto(): string {
    return this.esSituacionDeCalle
      ? 'Puedes dejar un correo o teléfono si quieres que te contacten, pero no es obligatorio.'
      : 'Deja un medio de contacto para que puedan avisarte rápidamente.';
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

    this.mensajeErrorImagenes = '';

    if (!files?.length) {
      return;
    }

    const cuposDisponibles =
      this.maxImagenes - this.existingImagePreviews.length - this.newImagePreviews.length;

    if (cuposDisponibles <= 0) {
      input.value = '';
      this.mensajeErrorImagenes = `Solo puedes subir un máximo de ${this.maxImagenes} imágenes en total.`;
      await Swal.fire({
        icon: 'warning',
        title: 'Límite de imágenes alcanzado',
        text: `Ya tienes ${this.maxImagenes} imágenes cargadas entre guardadas y nuevas.`,
      });
      return;
    }

    const selectedFiles = Array.from(files).slice(0, cuposDisponibles);

    const preparedImages = await this.imagenesService.prepareImagesForUpload(selectedFiles);

    this.newImagePreviews = [...this.newImagePreviews, ...preparedImages.map((image) => image.preview)];
    this.imagePayloads = [...this.imagePayloads, ...preparedImages.map((image) => image.base64)];
    input.value = '';
  }

  removeNewImage(index: number): void {
    this.newImagePreviews = this.newImagePreviews.filter((_, imageIndex) => imageIndex !== index);
    this.imagePayloads = this.imagePayloads.filter((_, imageIndex) => imageIndex !== index);
    this.mensajeErrorImagenes = '';
  }

  async removeExistingImage(index: number): Promise<void> {
    if (!this.mascotaId || this.existingImagePreviews.length <= 1 || this.eliminandoImagenGuardadaIndex !== null) {
      return;
    }

    const confirmacion = await Swal.fire({
      icon: 'warning',
      title: 'Eliminar imagen',
      text: 'Esta foto se quitará de la publicación. Debe quedar al menos una imagen guardada.',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d85b58',
    });

    if (!confirmacion.isConfirmed) {
      return;
    }

    this.eliminandoImagenGuardadaIndex = index;

    try {
      const mascotaActualizada = await this.imagenesService.eliminarImagenMascota(this.mascotaId, index);
      this.existingImagePreviews = (mascotaActualizada?.imagenes ?? []).map((imagen: string) =>
        imagen.startsWith('data:') ? imagen : `data:image/jpeg;base64,${imagen}`
      );

      await Swal.fire({
        icon: 'success',
        title: 'Imagen eliminada',
        text: 'La foto se quitó correctamente de la publicación.',
      });
    } catch (error) {
      await Swal.fire({
        icon: 'error',
        title: 'No se pudo eliminar la imagen',
        text: 'Intenta nuevamente. La mascota debe conservar al menos una foto guardada.',
      });
      console.error(error);
    } finally {
      this.eliminandoImagenGuardadaIndex = null;
    }
  }

  async submit(): Promise<void> {
    if (this.mensajeErrorImagenes) {
      await Swal.fire({
        icon: 'warning',
        title: 'Revisa las imágenes',
        text: this.mensajeErrorImagenes,
      });
      return;
    }

    if (!this.isFechaNacimientoValida()) {
      await Swal.fire({
        icon: 'warning',
        title: 'Fecha de nacimiento inválida',
        text: 'La fecha de nacimiento no puede ser futura.',
      });
      return;
    }

    if (!this.isPerdidoDesdeValida()) {
      await Swal.fire({
        icon: 'warning',
        title: 'Fecha de pérdida inválida',
        text: 'La fecha de pérdida no puede ser futura. Sí puede ser hoy.',
      });
      return;
    }

    if (!this.isContactoValido()) {
      await Swal.fire({
        icon: 'warning',
        title: 'Contacto incompleto',
        text: this.modoContacto === 'mail'
          ? 'Tu perfil no tiene un correo disponible para usar como contacto.'
          : 'Debes ingresar un teléfono de contacto válido.',
      });
      return;
    }

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
        nombre: this.nombre.trim() || undefined,
        especie: this.especie.trim().toLowerCase(),
        raza: this.raza.trim() || undefined,
        estado: this.estado,
        fechaNacimiento: this.fechaNacimiento || undefined,
        perdidoDesde: this.perdidoDesde || undefined,
        latitud: this.latitud ?? undefined,
        longitud: this.longitud ?? undefined,
        caracteristicasAdicionales: this.caracteristicasAdicionales.trim() || undefined,
        contacto: this.contactoSeleccionado || undefined
      };

      const response = this.modoEdicion && this.mascotaId
        ? await this.mascotaService.updateMascota(this.mascotaId, payload)
        : this.esPublicacionCallePublica
          ? await this.mascotaService.createMascotaPublica(payload)
          : await this.mascotaService.createMascota(payload);

      const mascotaId = this.mascotaId ?? response?.mascotaId ?? response?._id ?? response?.id;

      if (mascotaId && this.imagePayloads.length) {
        try {
          if (this.esPublicacionCallePublica) {
            await this.mascotaService.cargarImagenesPublicas(mascotaId, this.imagePayloads);
          } else {
            await this.imagenesService.cargarImagenesMascota(mascotaId, this.imagePayloads);
          }
        } catch (imageError) {
          if (!this.modoEdicion && !this.esPublicacionCallePublica) {
            await this.mascotaService.deleteMascota(mascotaId);
          }

          throw imageError;
        }
      }

      Swal.close();

      await Swal.fire({
        icon: 'success',
        title: this.modoEdicion ? 'Mascota actualizada' : 'Mascota inscrita',
        text: this.modoEdicion
          ? 'La información se actualizó correctamente.'
          : 'Tu publicación ya quedó registrada correctamente.'
      });

      await this.router.navigate([this.esPublicacionCallePublica ? '/situacion-de-calle' : '/mis-mascotas']);
    } catch (error) {
      Swal.close();
      await Swal.fire({
        icon: 'error',
        title: 'No se pudo inscribir',
        text: this.imagePayloads.length
          ? 'La mascota no pudo guardarse porque falló la subida final de imágenes, incluso después de comprimirlas. Intenta con menos fotos a la vez o vuelve a probar.'
          : 'Revisa los datos e intenta nuevamente.'
      });
      console.error(error);
    } finally {
      this.enviandoFormulario = false;
    }
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
    const contactoMascota = mascota.contacto?.trim() ?? '';
    this.modoContacto = contactoMascota && contactoMascota === this.userEmail ? 'mail' : 'telefono';
    this.contacto = this.modoContacto === 'telefono' ? contactoMascota : '';
    this.existingImagePreviews = (mascota.imagenes ?? []).map((imagen) =>
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

  private isFechaNacimientoValida(): boolean {
    if (this.esSituacionDeCalle && !this.fechaNacimiento) {
      return true;
    }

    if (!this.fechaNacimiento) {
      return false;
    }

    const fecha = new Date(`${this.fechaNacimiento}T00:00:00`);
    const hoy = this.getInicioDelDiaActual();

    return !Number.isNaN(fecha.getTime()) && fecha <= hoy;
  }

  private isPerdidoDesdeValida(): boolean {
    if (!this.perdidoDesde) {
      return true;
    }

    const fecha = new Date(`${this.perdidoDesde}T00:00:00`);
    const hoy = this.getInicioDelDiaActual();

    return !Number.isNaN(fecha.getTime()) && fecha <= hoy;
  }

  private isContactoValido(): boolean {
    if (this.esSituacionDeCalle && !this.contacto.trim() && (!this.puedeUsarCorreoPerfil || this.modoContacto !== 'mail')) {
      return true;
    }

    if (this.modoContacto === 'mail') {
      if (this.puedeUsarCorreoPerfil) {
        return true;
      }

      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.contacto.trim());
    }

    const telefono = this.contacto.replace(/\s+/g, '');
    return telefono.length >= 8;
  }

  private getInicioDelDiaActual(): Date {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    return hoy;
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
