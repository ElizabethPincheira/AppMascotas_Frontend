import { CommonModule } from '@angular/common';
import { Component, HostListener, Input, inject } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../../../core/services/auth.service';
import { Mascota } from '../../models/mascota.model';

@Component({
  selector: 'app-card-mascota',
  imports: [CommonModule],
  templateUrl: './card-mascota.component.html',
  styleUrls: ['./card-mascota.component.css']
})
export class CardMascotaComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private _mascota!: Mascota;
  currentImageIndex = 0;
  private touchStartX: number | null = null;

  @Input() set mascota(value: Mascota) {
    this._mascota = value;
    this.currentImageIndex = 0;
  }

  get mascota(): Mascota {
    return this._mascota;
  }

  shareMenuOpen = false;

  get imageList(): string[] {
    return this.mascota?.imagenes?.length ? this.mascota.imagenes : [''];
  }

  get currentImage(): string {
    return this.getImageSrc(this.imageList[this.currentImageIndex]);
  }

  get hasMultipleImages(): boolean {
    return this.imageList.length > 1;
  }

  get canOpenDetail(): boolean {
    return !!(this.mascota?._id ?? this.mascota?.id);
  }

  get shareWhatsappUrl(): string {
    return `https://wa.me/?text=${encodeURIComponent(this.getShareWhatsappText())}`;
  }

  get facebookShareUrl(): string {
    return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(this.getCaseUrl())}`;
  }

  nextImage(): void {
    if (!this.hasMultipleImages) {
      return;
    }

    this.currentImageIndex = (this.currentImageIndex + 1) % this.imageList.length;
  }

  prevImage(): void {
    if (!this.hasMultipleImages) {
      return;
    }

    this.currentImageIndex = (this.currentImageIndex - 1 + this.imageList.length) % this.imageList.length;
  }

  goToImage(index: number): void {
    if (index < 0 || index >= this.imageList.length) {
      return;
    }

    this.currentImageIndex = index;
  }

  onTouchStart(event: TouchEvent): void {
    this.touchStartX = event.changedTouches[0]?.clientX ?? null;
  }

  onTouchEnd(event: TouchEvent): void {
    if (this.touchStartX === null || !this.hasMultipleImages) {
      return;
    }

    const touchEndX = event.changedTouches[0]?.clientX ?? this.touchStartX;
    const deltaX = touchEndX - this.touchStartX;

    if (Math.abs(deltaX) > 35) {
      if (deltaX < 0) {
        this.nextImage();
      } else {
        this.prevImage();
      }
    }

    this.touchStartX = null;
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

  getOwnerLocation(): string | null {
    if (typeof this.mascota.usuarioId !== 'object' || !this.mascota.usuarioId) {
      return null;
    }

    return this.mascota.usuarioId.comuna ?? this.mascota.usuarioId.ciudad ?? null;
  }

  getOwnerEmail(): string | null {
    if (typeof this.mascota.usuarioId !== 'object' || !this.mascota.usuarioId?.email) {
      return null;
    }

    return this.mascota.usuarioId.email;
  }

  getEmailContact(): string | null {
    const contact = this.getPreferredContact();
    return contact && this.isEmail(contact) ? contact : null;
  }

  getWhatsappUrl(): string | null {
    const contact = this.mascota.contacto?.trim();

    if (!contact || this.isEmail(contact)) {
      return null;
    }

    const sanitizedPhone = contact.replace(/\D+/g, '');
    return sanitizedPhone ? `https://wa.me/${sanitizedPhone}` : null;
  }

  getPrimaryLocation(): string {
    const comuna = this.mascota.comunaPerdida?.trim();
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
      this.mascota.ubicacionPerdida ??
      this.mascota.ubicacion ??
      'Ubicación no informada'
    );
  }

  private getNearbyReference(): string | null {
    const savedNearbyReference = this.mascota.callesCercanas?.trim();
    if (savedNearbyReference) {
      return savedNearbyReference;
    }

    const address = this.mascota.ubicacionPerdida?.trim();

    if (!address || address.startsWith('Ubicación detectada (')) {
      return null;
    }

    const ignoredParts = [
      this.mascota.comunaPerdida,
      this.mascota.provinciaPerdida,
      this.mascota.regionPerdida,
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

  private getCaseLocation(): string | null {
    const parts = [
      this.mascota.comunaPerdida,
      this.mascota.provinciaPerdida,
      this.mascota.regionPerdida,
    ].filter((value, index, list): value is string => !!value && list.indexOf(value) === index);

    return parts.length ? parts.join(', ') : null;
  }

  getAgeText(): string | null {
    if (!this.mascota.fechaNacimiento) {
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
    if (!this.mascota.createdAt) {
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

  getShareLocation(): string {
    return this.mascota.ubicacionPerdida ?? this.getCaseLocation() ?? this.mascota.ubicacion ?? 'Chile';
  }

  getEmotionalMessage(): string {
    switch (this.mascota.estado) {
      case 'Robado':
      case 'Extraviado':
        return 'Me perdí, ayúdame a volver con mi familia.';
      case 'Encontrado':
        return 'Estoy esperando que alguien me reconozca.';
      case 'Recuperado':
        return 'Gracias a ti, hoy estoy de vuelta con mi familia.';
      case 'Busca hogar':
        return 'Estoy buscando una familia que me quiera.';
      case 'Emparejado':
        return 'Ya encontró compañía, gracias por el apoyo.';
      case 'Situacion de calle':
        return 'Necesito una oportunidad para salir de la calle y encontrar un hogar.';
      case 'Adoptado':
        return 'Ya encontré una familia, gracias por ayudar.';
      default:
        return 'Ayúdame a que mi historia tenga un final feliz.';
    }
  }

  esCasoResuelto(): boolean {
    return ['Recuperado', 'Adoptado', 'Emparejado'].includes(this.mascota.estado);
  }

  toggleShareMenu(): void {
    this.shareMenuOpen = !this.shareMenuOpen;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const shareMenuElement = document.querySelector('.share-menu');
    const isClickInsideMenu = shareMenuElement?.contains(event.target as Node);

    if (!isClickInsideMenu && this.shareMenuOpen) {
      this.shareMenuOpen = false;
    }
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

  getDistanceText(): string | null {
    if (!this.isLostCase() || typeof this.mascota.distanciaKm !== 'number' || !Number.isFinite(this.mascota.distanciaKm)) {
      return null;
    }

    if (this.mascota.distanciaKm < 1) {
      return 'A menos de 1 km de ti';
    }

    return `A ${this.mascota.distanciaKm.toFixed(1)} km de ti`;
  }

  getMapUrl(): string | null {
    if (typeof this.mascota.latitud === 'number' && typeof this.mascota.longitud === 'number') {
      return `https://www.google.com/maps/search/?api=1&query=${this.mascota.latitud},${this.mascota.longitud}`;
    }

    const location = this.getShareLocation()?.trim();
    return location ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}` : null;
  }

  isLostCase(): boolean {
    return ['Robado', 'Extraviado', 'Encontrado', 'Recuperado'].includes(this.mascota.estado);
  }

  getEstadoClase(estado: string): string {

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

  contactOwner(): void {
    const email = this.getEmailContact();

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

  openDetail(): void {
    const id = this.mascota?._id ?? this.mascota?.id;

    if (!id) {
      return;
    }

    this.router.navigate(['/mascotas', id]);
  }

  onCardKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }

    event.preventDefault();
    this.openDetail();
  }

  private getPreferredContact(): string | null {
    const contacto = this.mascota.contacto?.trim();
    return contacto || this.getOwnerEmail();
  }

  private getCaseUrl(): string {
    const id = this.mascota?._id ?? this.mascota?.id;
    const origin = typeof window !== 'undefined' ? window.location.origin : '';

    return id ? `${origin}/mascotas/${id}` : origin;
  }

  private getShareWhatsappText(): string {
    return `🐾 Ayúdame a encontrar a ${this.mascota.nombre}. ${this.mascota.estado} en ${this.getShareLocation()}.\nMás info: ${this.getCaseUrl()}`;
  }

  private isEmail(contact: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact);
  }
}
