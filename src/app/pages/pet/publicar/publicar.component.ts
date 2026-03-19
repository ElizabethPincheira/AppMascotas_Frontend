import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { ImagenesService } from '../../../core/services/imagenes.service';
import { MascotaService } from '../../../core/services/mascota.service';
import { UbicacionesService } from '../../../core/services/ubicaciones.service';
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
  private readonly ubicacionesService = inject(UbicacionesService);
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
  regionPerdida = '';
  provinciaPerdida = '';
  comunaPerdida = '';
  caracteristicasAdicionales = '';
  contacto = '';

  regiones: string[] = [];
  provincias: string[] = [];
  comunas: string[] = [];

  cargandoRegiones = false;
  cargandoProvincias = false;
  cargandoComunas = false;
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

  async ngOnInit(): Promise<void> {
    await this.cargarRegiones();

    this.mascotaId = this.route.snapshot.paramMap.get('id');
    this.modoEdicion = !!this.mascotaId;

    if (this.modoEdicion && this.mascotaId) {
      await this.cargarMascotaParaEditar(this.mascotaId);
    }
  }

  get formularioCompleto(): boolean {
    return !!(
      this.nombre.trim() &&
      this.especie.trim() &&
      this.raza.trim() &&
      this.estado.trim() &&
      this.fechaNacimiento &&
      this.contacto.trim()
    );
  }

  async cargarRegiones(): Promise<void> {
    this.cargandoRegiones = true;
    try {
      this.regiones = await this.ubicacionesService.getUbicaciones();
    } finally {
      this.cargandoRegiones = false;
    }
  }

  async onRegionChange(): Promise<void> {
    this.provinciaPerdida = '';
    this.comunaPerdida = '';
    this.provincias = [];
    this.comunas = [];

    if (!this.regionPerdida) {
      return;
    }

    await this.cargarProvincias();
  }

  async onProvinciaChange(): Promise<void> {
    this.comunaPerdida = '';
    this.comunas = [];

    if (!this.regionPerdida || !this.provinciaPerdida) {
      return;
    }

    await this.cargarComunas();
  }

  private async cargarProvincias(): Promise<void> {
    this.cargandoProvincias = true;
    try {
      this.provincias = await this.ubicacionesService.getUbicaciones(this.regionPerdida);
    } finally {
      this.cargandoProvincias = false;
    }
  }

  private async cargarComunas(): Promise<void> {
    this.cargandoComunas = true;
    try {
      this.comunas = await this.ubicacionesService.getUbicaciones(this.regionPerdida, this.provinciaPerdida);
    } finally {
      this.cargandoComunas = false;
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
        regionPerdida: this.regionPerdida || undefined,
        provinciaPerdida: this.provinciaPerdida || undefined,
        comunaPerdida: this.comunaPerdida || undefined,
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
    this.regionPerdida = mascota.regionPerdida ?? '';
    this.provinciaPerdida = mascota.provinciaPerdida ?? '';
    this.comunaPerdida = mascota.comunaPerdida ?? '';
    this.caracteristicasAdicionales = mascota.caracteristicasAdicionales ?? '';
    this.contacto = mascota.contacto ?? '';
    this.imagePreviews = (mascota.imagenes ?? []).map((imagen) =>
      imagen.startsWith('data:') ? imagen : `data:image/jpeg;base64,${imagen}`
    );

    if (this.regionPerdida) {
      await this.cargarProvincias();
    }

    if (this.provinciaPerdida) {
      await this.cargarComunas();
    }
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
}
