import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { MascotaService } from '../../../core/services/mascota.service';
import { UbicacionesService } from '../../../core/services/ubicaciones.service';

@Component({
  selector: 'app-publicar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './publicar.component.html',
  styleUrls: ['./publicar.component.css']
})
export class PublicarComponent {
  private readonly mascotaService = inject(MascotaService);
  private readonly ubicacionesService = inject(UbicacionesService);
  private readonly router = inject(Router);

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

    this.cargandoProvincias = true;
    try {
      this.provincias = await this.ubicacionesService.getUbicaciones(this.regionPerdida);
    } finally {
      this.cargandoProvincias = false;
    }
  }

  async onProvinciaChange(): Promise<void> {
    this.comunaPerdida = '';
    this.comunas = [];

    if (!this.regionPerdida || !this.provinciaPerdida) {
      return;
    }

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
    const results = await Promise.all(selectedFiles.map((file) => this.readFileAsDataUrl(file)));

    this.imagePreviews = results;
    this.imagePayloads = results.map((result) => result.split(',')[1] ?? result);
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
      const createdMascota = await this.mascotaService.createMascota({
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
      });

      const mascotaId = createdMascota?._id ?? createdMascota?.id;

      if (mascotaId && this.imagePayloads.length) {
        await this.mascotaService.cargarImagenes(mascotaId, this.imagePayloads);
      }

      Swal.close();

      await Swal.fire({
        icon: 'success',
        title: 'Mascota inscrita',
        text: 'Tu publicación ya quedó registrada correctamente.'
      });

      await this.router.navigate(['/perdidos']);
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

  private readFileAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}
