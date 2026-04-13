import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../../../core/services/auth.service';
import { MascotaService } from '../../../core/services/mascota.service';
import { SeoService } from '../../../core/services/seo.service';
import { Mascota } from '../../../shared/models/mascota.model';

@Component({
  selector: 'app-detalle-mascota',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './detalle-mascota.component.html',
  styleUrls: ['./detalle-mascota.component.css']
})
export class DetalleMascotaComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly mascotaService = inject(MascotaService);
  private readonly authService = inject(AuthService);
  private readonly seoService = inject(SeoService);

  mascota: Mascota | null = null;
  cargando = false;
  imagenActiva = 0;
  shareMenuOpen = false;
  readonly estadosResueltos: Array<Mascota['estado']> = ['Recuperado', 'Adoptado', 'Emparejado'];

  async ngOnInit(): Promise<void> {
    this.seoService.setPage(
      'Detalle de mascota — Círculo Animal',
      'Conoce la información completa de la mascota publicada en Círculo Animal.',
    );

    await this.cargarMascota();
  }

  get imageList(): string[] {
    return this.mascota?.imagenes?.length ? this.mascota.imagenes : [''];
  }

  get imagenPrincipal(): string {
    return this.getImageSrc(this.imageList[this.imagenActiva]);
  }

  get ownerName(): string | null {
    if (typeof this.mascota?.usuarioId !== 'object' || !this.mascota.usuarioId?.nombre) {
      return null;
    }

    return this.mascota.usuarioId.nombre;
  }

  get ownerLocation(): string | null {
    if (typeof this.mascota?.usuarioId !== 'object' || !this.mascota.usuarioId) {
      return null;
    }

    return this.mascota.usuarioId.comuna ?? this.mascota.usuarioId.ciudad ?? null;
  }

  get ownerEmail(): string | null {
    if (typeof this.mascota?.usuarioId !== 'object' || !this.mascota.usuarioId?.email) {
      return null;
    }

    return this.mascota.usuarioId.email;
  }

  get contactoEmail(): string | null {
    const contacto = this.getPreferredContact();
    return contacto && this.isEmail(contacto) ? contacto : null;
  }

  get whatsappUrl(): string | null {
    const contacto = this.mascota?.contacto?.trim();

    if (!contacto || this.isEmail(contacto)) {
      return null;
    }

    const sanitizedPhone = contacto.replace(/\D+/g, '');
    return sanitizedPhone ? `https://wa.me/${sanitizedPhone}` : null;
  }

  get shareWhatsappUrl(): string {
    return `https://wa.me/?text=${encodeURIComponent(this.getShareWhatsappText())}`;
  }

  get facebookShareUrl(): string {
    return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(this.getCaseUrl())}`;
  }

  get usuarioActualId(): string | null {
    const user = this.authService.getUser();

    if (!user) {
      return null;
    }

    return user._id ?? user.id ?? null;
  }

  get puedeEditarCaso(): boolean {
    if (!this.mascota || this.esCasoResuelto()) {
      return false;
    }

    const ownerId = this.obtenerUsuarioId(this.mascota.usuarioId);
    return !!this.usuarioActualId && !!ownerId && this.usuarioActualId === ownerId;
  }

  async cargarMascota(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.mascota = null;
      return;
    }

    this.cargando = true;

    try {
      this.mascota = await this.mascotaService.getMascotaById(id);
      this.imagenActiva = 0;
      this.updateSeo();
    } catch (error) {
      console.error('Error al cargar detalle de mascota:', error);
      this.mascota = null;
    } finally {
      this.cargando = false;
    }
  }

  seleccionarImagen(index: number): void {
    if (index < 0 || index >= this.imageList.length) {
      return;
    }

    this.imagenActiva = index;
  }

  getImageSrc(imagen?: string): string {
    if (!imagen) {
      return this.getFallbackImage();
    }

    if (imagen.startsWith('http://') || imagen.startsWith('https://') || imagen.startsWith('data:')) {
      return imagen;
    }

    return `data:image/jpeg;base64,${imagen}`;
  }

  getEstadoClase(estado?: string): string {
    switch (estado) {
      case 'Robado':
        return 'estado-robado';
      case 'Extraviado':
        return 'estado-extraviado';
      case 'Encontrado':
        return 'estado-encontrado';
      case 'Recuperado':
        return 'estado-recuperado';
      case 'Busca hogar':
        return 'estado-busca-hogar';
      case 'Adoptado':
        return 'estado-adoptado';
      case 'Situacion de calle':
        return 'estado-situacion-calle';
      case 'Buscando pareja':
        return 'estado-buscando-pareja';
      case 'Emparejado':
        return 'estado-emparejado';
      default:
        return 'estado-default';
    }
  }

  getAgeText(): string | null {
    if (!this.mascota?.fechaNacimiento) {
      return null;
    }

    const birthDate = new Date(this.mascota.fechaNacimiento);

    if (Number.isNaN(birthDate.getTime())) {
      return null;
    }

    const now = new Date();
    let years = now.getFullYear() - birthDate.getFullYear();
    let months = now.getMonth() - birthDate.getMonth();

    if (months < 0) {
      years -= 1;
      months += 12;
    }

    if (years > 0) {
      return `${years} ${years === 1 ? 'año' : 'años'}`;
    }

    return `${Math.max(months, 1)} ${months === 1 ? 'mes' : 'meses'}`;
  }

  getPublishedText(): string | null {
    if (!this.mascota?.createdAt) {
      return null;
    }

    const createdAt = new Date(this.mascota.createdAt);

    if (Number.isNaN(createdAt.getTime())) {
      return null;
    }

    return createdAt.toLocaleDateString('es-CL', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  getPrimaryLocation(): string {
    const comuna = this.mascota?.comunaPerdida?.trim();
    const nearbyReference = this.getNearbyReference();
    const locationWithReference =
      comuna &&
      nearbyReference &&
      this.normalizarTextoUbicacion(comuna) !== this.normalizarTextoUbicacion(nearbyReference)
        ? `${comuna} · Cerca de ${nearbyReference}`
        : null;

    return (
      locationWithReference ??
      comuna ??
      nearbyReference ??
      this.getCaseLocation() ??
      this.mascota?.ubicacionPerdida ??
      this.mascota?.ubicacion ??
      'Ubicación no informada'
    );
  }

  getUbicacionCompleta(): string[] {
    if (!this.mascota) {
      return [];
    }

    return [
      this.mascota.callesCercanas,
      this.mascota.ubicacionPerdida,
      this.mascota.comunaPerdida,
      this.mascota.provinciaPerdida,
      this.mascota.regionPerdida,
      this.mascota.ubicacion,
    ].filter((value, index, list): value is string => !!value && list.indexOf(value) === index);
  }

  getCaseLocation(): string | null {
    if (!this.mascota) {
      return null;
    }

    const parts = [
      this.mascota.comunaPerdida,
      this.mascota.provinciaPerdida,
      this.mascota.regionPerdida,
    ].filter((value, index, list): value is string => !!value && list.indexOf(value) === index);

    return parts.length ? parts.join(', ') : null;
  }

  getMapUrl(): string | null {
    if (!this.mascota) {
      return null;
    }

    if (typeof this.mascota.latitud === 'number' && typeof this.mascota.longitud === 'number') {
      return `https://www.google.com/maps/search/?api=1&query=${this.mascota.latitud},${this.mascota.longitud}`;
    }

    const location = (this.mascota.ubicacionPerdida || this.getPrimaryLocation()).trim();
    return location ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}` : null;
  }

  esCasoResuelto(): boolean {
    return !!this.mascota && this.estadosResueltos.includes(this.mascota.estado);
  }

  toggleShareMenu(): void {
    this.shareMenuOpen = !this.shareMenuOpen;
  }

  async copyCaseLink(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.getCaseUrl());
      this.shareMenuOpen = false;

      await Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: '¡Link copiado!',
        showConfirmButton: false,
        timer: 1800,
        timerProgressBar: true,
      });
    } catch {
      await Swal.fire({
        icon: 'error',
        title: 'No se pudo copiar el link',
        text: 'Intenta nuevamente en unos segundos.',
      });
    }
  }

  private updateSeo(): void {
    if (!this.mascota) {
      return;
    }

    const title = `${this.mascota.nombre || 'Mascota'} — Círculo Animal`;
    const description = this.buildSeoDescription();
    const image = this.mascota.imagenes?.[0]
      ? this.getImageSrc(this.mascota.imagenes[0])
      : undefined;

    this.seoService.setPage(title, description, image);
  }

  private buildSeoDescription(): string {
    if (!this.mascota) {
      return 'Conoce la información completa de la mascota publicada en Círculo Animal.';
    }

    const pieces = [
      this.mascota.descripcion,
      this.mascota.raza ? `Raza: ${this.mascota.raza}.` : '',
      this.mascota.estado ? `Estado: ${this.mascota.estado}.` : '',
      this.mascota.comunaPerdida || this.mascota.regionPerdida
        ? `Ubicación: ${[this.mascota.comunaPerdida, this.mascota.regionPerdida].filter(Boolean).join(', ')}.`
        : '',
    ].filter(Boolean);

    return pieces.join(' ').trim() || 'Conoce la información completa de la mascota publicada en Círculo Animal.';
  }

  getEmotionalMessage(): string {
    switch (this.mascota?.estado) {
      case 'Robado':
      case 'Extraviado':
        return 'Cada dato puede acercarla de vuelta a casa.';
      case 'Encontrado':
        return 'Su familia podría estar buscándola justo ahora.';
      case 'Recuperado':
        return 'Gracias a la comunidad, hoy ya está nuevamente con su familia.';
      case 'Busca hogar':
        return 'Quizás aquí comience su próxima gran historia.';
      case 'Adoptado':
        return 'Ya encontró un hogar, pero su historia sigue inspirando.';
      case 'Situacion de calle':
        return 'Necesita visibilidad, cuidado y una nueva oportunidad.';
      case 'Emparejado':
        return 'El apoyo de la comunidad hizo posible este final feliz.';
      default:
        return 'Tu ayuda puede marcar una diferencia real en este caso.';
    }
  }

  async marcarCasoComoResuelto(): Promise<void> {
    const id = this.mascota?._id ?? this.mascota?.id;

    if (!id || !this.mascota || !this.puedeEditarCaso) {
      return;
    }

    const confirmacion = await Swal.fire({
      icon: 'question',
      title: '¿Confirmás que tu mascota fue encontrada o el caso está resuelto?',
      input: 'select',
      inputOptions: {
        Recuperado: 'Recuperado',
        Adoptado: 'Adoptado',
        Emparejado: 'Emparejado',
      },
      inputPlaceholder: 'Selecciona el nuevo estado',
      inputValue: 'Recuperado',
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar',
      inputValidator: (value) => {
        if (!value) {
          return 'Debes elegir un estado para continuar.';
        }

        return null;
      },
    });

    if (!confirmacion.isConfirmed || !confirmacion.value) {
      return;
    }

    await this.mascotaService.updateMascota(String(id), {
      estado: confirmacion.value,
    });

    this.mascota = {
      ...this.mascota,
      estado: confirmacion.value,
    };

    await Swal.fire({
      icon: 'success',
      title: 'Caso actualizado',
      text: 'La publicación fue marcada como resuelta.',
    });
  }

  contactOwner(): void {
    const email = this.contactoEmail;

    if (!email) {
      return;
    }

    if (this.authService.isLogged()) {
      window.location.href = `mailto:${email}`;
      return;
    }

    this.router.navigate(['/login'], {
      queryParams: {
        message: 'Inicia sesión para ver el contacto',
        redirect: this.router.url,
      },
    });
  }

  private getPreferredContact(): string | null {
    const contacto = this.mascota?.contacto?.trim();
    return contacto || this.ownerEmail;
  }

  private getCaseUrl(): string {
    const id = this.mascota?._id ?? this.mascota?.id;
    const origin = typeof window !== 'undefined' ? window.location.origin : '';

    return id ? `${origin}/mascotas/${id}` : origin;
  }

  private getShareLocation(): string {
    return this.getPrimaryLocation();
  }

  private getNearbyReference(): string | null {
    const savedNearbyReference = this.mascota?.callesCercanas?.trim();
    if (savedNearbyReference) {
      return savedNearbyReference;
    }

    const address = this.mascota?.ubicacionPerdida?.trim();

    if (!address || address.startsWith('Ubicación detectada (')) {
      return null;
    }

    const ignoredParts = [
      this.mascota?.comunaPerdida,
      this.mascota?.provinciaPerdida,
      this.mascota?.regionPerdida,
      'Chile',
    ]
      .filter(Boolean)
      .map((value) => this.normalizarTextoUbicacion(value as string));

    const segments = address
      .split(',')
      .map((segment) => segment.trim())
      .filter(Boolean)
      .filter((segment) => !ignoredParts.includes(this.normalizarTextoUbicacion(segment)));

    if (!segments.length) {
      return null;
    }

    return segments.slice(0, 2).join(', ');
  }

  private normalizarTextoUbicacion(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLowerCase();
  }

  private getShareWhatsappText(): string {
    return `🐾 Ayúdame a encontrar a ${this.mascota?.nombre || 'esta mascota'}. ${this.mascota?.estado || 'Caso activo'} en ${this.getShareLocation()}.\nMás info: ${this.getCaseUrl()}`;
  }

  private isEmail(contact: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact);
  }

  private obtenerUsuarioId(usuario: Mascota['usuarioId'] | null | undefined): string | null {
    if (!usuario) {
      return null;
    }

    if (typeof usuario === 'string') {
      return usuario;
    }

    return usuario._id ?? null;
  }

  private getFallbackImage(): string {
    const initial = (this.mascota?.nombre?.trim()?.charAt(0) || 'M').toUpperCase();
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 420">
        <defs>
          <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#edf7e7" />
            <stop offset="100%" stop-color="#f8ead3" />
          </linearGradient>
        </defs>
        <rect width="600" height="420" rx="36" fill="url(#bg)" />
        <circle cx="300" cy="165" r="90" fill="#ffffff" fill-opacity="0.92" />
        <text x="300" y="196" text-anchor="middle" font-family="Arial, sans-serif" font-size="92" font-weight="700" fill="#3f6f2b">${initial}</text>
        <text x="300" y="324" text-anchor="middle" font-family="Arial, sans-serif" font-size="30" fill="#2f4536">Circulo Animal</text>
      </svg>
    `;

    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  }
}
