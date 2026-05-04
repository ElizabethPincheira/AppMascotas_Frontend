import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../../../core/services/auth.service';
import { ImagenesService } from '../../../core/services/imagenes.service';
import { ProductosService, Producto, CreateProductoDto } from '../../../core/services/productos.service';
import { UsersService } from '../../../core/services/users.service';
import { UbicacionesService } from '../../../core/services/ubicaciones.service';
import { STORE_CATEGORIES } from '../../ecommer/tiendas/store-categories.data';

interface StoreScheduleRow {
  dia: string;
  abierto: boolean;
  apertura: string;
  cierre: string;
}

@Component({
  selector: 'app-mi-tienda',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mi-tienda.component.html',
  styleUrl: './mi-tienda.component.css'
})
export class MiTiendaComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly imagenesService = inject(ImagenesService);
  private readonly productosService = inject(ProductosService);
  private readonly usersService = inject(UsersService);
  private readonly ubicacionesService = inject(UbicacionesService);

  user = this.authService.getUser();
  productos: Producto[] = [];
  cargandoProductos = false;
  mostrarFormulario = false;
  enviandoProducto = false;
  editandoProductoId: string | null = null;
  imagenPreview: string | null = null;
  comprimiendoImagen = false;
  imagenTiendaPreview: string | null = null;
  imagenTiendaBase64: string | null = null;
  procesandoImagenTienda = false;
  guardandoCobertura = false;
  regionesDisponibles: string[] = [];
  provinciasDisponibles: string[] = [];
  comunasDisponibles: string[] = [];
  cargandoRegiones = false;
  cargandoProvincias = false;
  cargandoComunas = false;
  guardandoDetalles = false;
  readonly categoriasDisponibles = STORE_CATEGORIES;

  readonly diasSemana = [
    'Lunes',
    'Martes',
    'Miercoles',
    'Jueves',
    'Viernes',
    'Sabado',
    'Domingo',
  ];

  repartoForm = {
    regionTienda: this.user?.regionTienda || this.user?.region || '',
    provinciaTienda: this.user?.provinciaTienda || this.user?.provincia || '',
    comunaTienda: this.user?.comunaTienda || this.user?.comuna || '',
    comunasRepartoTienda: Array.isArray(this.user?.comunasRepartoTienda) ? [...this.user.comunasRepartoTienda] : [],
  };

  detallesForm = {
    nombreTienda: this.user?.nombreTienda || '',
    descripcionTienda: this.user?.descripcionTienda || '',
    direccionTienda: this.user?.direccionTienda || '',
    telefonoTienda: this.user?.telefonoTienda || '',
    categoriaSeleccionada: '',
    categoriasSeleccionadas: Array.isArray(this.user?.categoriasTienda) ? [...this.user.categoriasTienda] : [],
  };

  horarioForm: StoreScheduleRow[] = this.buildScheduleForm(this.user?.horarioTienda);

  nuevoProductoForm: CreateProductoDto = {
    nombre: '',
    descripcion: '',
    precio: 0,
    unidadVenta: 'unidad',
    disponible: true,
  };

  async ngOnInit(): Promise<void> {
    await this.cargarProductos();
    await this.cargarRegionesReparto();

    if (this.repartoForm.regionTienda) {
      await this.onRegionRepartoChange(false);
    }

    if (this.repartoForm.provinciaTienda && this.provinciasDisponibles.includes(this.repartoForm.provinciaTienda)) {
      await this.onProvinciaRepartoChange(false);
    } else if (this.repartoForm.provinciaTienda) {
      this.repartoForm.provinciaTienda = '';
      this.repartoForm.comunaTienda = '';
      this.repartoForm.comunasRepartoTienda = [];
    }
  }

  private async cargarProductos(): Promise<void> {
    this.cargandoProductos = true;

    try {
      this.productos = await this.productosService.getProductosByTienda();
    } catch (error) {
      console.error('Error al cargar productos:', error);
    } finally {
      this.cargandoProductos = false;
    }
  }

  get displayName(): string {
    return this.user?.nombre || this.user?.name || this.user?.username || 'Usuario';
  }

  get nombreTienda(): string {
    return this.user?.nombreTienda || 'Sin nombre';
  }

  get descripcionTienda(): string {
    return this.user?.descripcionTienda || 'Sin descripción';
  }

  get direccionTienda(): string {
    return this.user?.direccionTienda || 'Sin dirección';
  }

  get telefonoTienda(): string {
    return this.user?.telefonoTienda || 'Sin teléfono';
  }

  get imagenTiendaActual(): string | null {
    return this.imagenTiendaPreview || this.toDisplayImage(this.user?.imagenTienda) || null;
  }

  get categoriasTienda(): string[] {
    return Array.isArray(this.user?.categoriasTienda) ? this.user.categoriasTienda : [];
  }

  get comunasRepartoTienda(): string[] {
    return Array.isArray(this.user?.comunasRepartoTienda) ? this.user.comunasRepartoTienda : [];
  }

  get estadoTienda(): string {
    return this.user?.estadoSolicitudTienda || 'ninguna';
  }

  get tiendaPerfilBasicoCompleto(): boolean {
    return !!(
      this.user?.nombreTienda?.trim() &&
      this.user?.descripcionTienda?.trim() &&
      this.user?.direccionTienda?.trim() &&
      this.user?.telefonoTienda?.trim() &&
      this.user?.regionTienda?.trim() &&
      this.user?.provinciaTienda?.trim() &&
      this.user?.comunaTienda?.trim() &&
      Array.isArray(this.user?.categoriasTienda) &&
      this.user.categoriasTienda.length > 0
    );
  }

  get tieneProductosPublicables(): boolean {
    return this.productos.some((producto) => producto.activo !== false);
  }

  get tiendaVisiblePublicamente(): boolean {
    return (
      this.estadoTienda === 'aprobada' &&
      this.tiendaPerfilBasicoCompleto &&
      this.tieneProductosPublicables
    );
  }

  get coberturaValida(): boolean {
    return !!(
      this.repartoForm.regionTienda &&
      this.repartoForm.provinciaTienda &&
      this.repartoForm.comunasRepartoTienda.length > 0
    );
  }

  get detallesValidos(): boolean {
    return !!(
      this.detallesForm.nombreTienda.trim() &&
      this.detallesForm.descripcionTienda.trim() &&
      this.detallesForm.direccionTienda.trim() &&
      this.detallesForm.telefonoTienda.trim() &&
      this.detallesForm.categoriasSeleccionadas.length > 0
    );
  }

  agregarCategoriaSeleccionada(): void {
    const categoria = this.detallesForm.categoriaSeleccionada;

    if (!categoria || this.detallesForm.categoriasSeleccionadas.includes(categoria)) {
      return;
    }

    this.detallesForm.categoriasSeleccionadas = [
      ...this.detallesForm.categoriasSeleccionadas,
      categoria,
    ];
    this.detallesForm.categoriaSeleccionada = '';
  }

  eliminarCategoria(categoria: string): void {
    this.detallesForm.categoriasSeleccionadas = this.detallesForm.categoriasSeleccionadas
      .filter((item) => item !== categoria);
  }

  get formularioValido(): boolean {
    return !!(
      this.nuevoProductoForm.nombre.trim() &&
      this.nuevoProductoForm.descripcion.trim() &&
      this.nuevoProductoForm.precio > 0
    );
  }

  get tituloFormularioProducto(): string {
    return this.editandoProductoId ? 'Editar producto' : 'Agregar producto';
  }

  toggleFormulario(): void {
    this.mostrarFormulario = !this.mostrarFormulario;
    this.editandoProductoId = null;
    this.resetearFormulario();
  }

  cancelarFormulario(): void {
    this.mostrarFormulario = false;
    this.editandoProductoId = null;
    this.resetearFormulario();
  }

  resetearFormulario(): void {
    this.nuevoProductoForm = {
      nombre: '',
      descripcion: '',
      precio: 0,
      unidadVenta: 'unidad',
      disponible: true,
    };
    this.imagenPreview = null;
    this.resetProductoImageInput();
  }

  isProductoDisponible(producto: Producto): boolean {
    if (typeof producto.disponible === 'boolean') {
      return producto.disponible;
    }

    if (typeof producto.stock === 'number') {
      return producto.stock > 0;
    }

    return true;
  }

  getImagenProducto(producto: Producto): string | null {
    return this.toDisplayImage(producto.imagen) || null;
  }

  getUnidadVentaLabel(producto: Pick<Producto, 'unidadVenta'> | CreateProductoDto): string {
    return producto.unidadVenta === 'kilo' ? 'kg' : 'unidad';
  }

  getPrecioProductoLabel(producto: Pick<Producto, 'precio' | 'unidadVenta'>): string {
    const precio = new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(producto.precio);

    return producto.unidadVenta === 'kilo' ? `${precio} / kg` : `${precio} c/u`;
  }

  getImagenTiendaInfo(): string | null {
    return this.toDisplayImage(this.user?.imagenTienda) || null;
  }

  async onImagenTiendaSeleccionada(event: Event): Promise<void> {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      target.value = '';
      await Swal.fire({
        icon: 'error',
        title: 'Tipo de archivo inválido',
        text: 'Por favor, selecciona una imagen válida para tu tienda.',
        confirmButtonText: 'Entendido'
      });
      return;
    }

    this.procesandoImagenTienda = true;

    try {
      const [preparedImage] = await this.imagenesService.prepareImagesForUpload([file]);

      if (!preparedImage) {
        throw new Error('No se pudo preparar la imagen.');
      }

      this.imagenTiendaPreview = preparedImage.preview;
      this.imagenTiendaBase64 = preparedImage.base64;
    } catch (error) {
      console.error('Error al procesar imagen de tienda:', error);

      await Swal.fire({
        icon: 'error',
        title: 'Error al procesar imagen',
        text: 'Ocurrió un problema al preparar la imagen de tu tienda.',
        confirmButtonText: 'Entendido'
      });
    } finally {
      this.procesandoImagenTienda = false;
      target.value = '';
    }
  }

  limpiarImagenTiendaSeleccionada(): void {
    this.imagenTiendaPreview = null;
    this.imagenTiendaBase64 = null;

    const fileInput = document.getElementById('store-image-input') as HTMLInputElement | null;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  async onImagenSeleccionada(event: Event): Promise<void> {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      target.value = '';
      await Swal.fire({
        icon: 'error',
        title: 'Tipo de archivo inválido',
        text: 'Por favor, selecciona una imagen (JPG, PNG, etc.)',
        confirmButtonText: 'Entendido'
      });
      return;
    }

    this.comprimiendoImagen = true;

    try {
      const imagenComprimida = await this.productosService.compressImage(file);
      this.imagenPreview = imagenComprimida;
      this.nuevoProductoForm.imagen = imagenComprimida;
    } catch (error) {
      await Swal.fire({
        icon: 'error',
        title: 'Error al procesar imagen',
        text: 'Ocurrió un problema al procesar la imagen.',
        confirmButtonText: 'Entendido'
      });
    } finally {
      this.comprimiendoImagen = false;
      target.value = '';
    }
  }

  removerImagen(): void {
    this.imagenPreview = null;
    this.nuevoProductoForm.imagen = undefined;
    this.resetProductoImageInput();
  }

  editarProducto(producto: Producto): void {
    this.editandoProductoId = producto._id;
    this.mostrarFormulario = true;
    this.nuevoProductoForm = {
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      precio: producto.precio,
      unidadVenta: producto.unidadVenta || 'unidad',
      disponible: this.isProductoDisponible(producto),
      imagen: producto.imagen,
    };
    this.imagenPreview = this.getImagenProducto(producto);
    this.resetProductoImageInput();
  }

  async agregarProducto(): Promise<void> {
    this.enviandoProducto = true;

    try {
      if (this.editandoProductoId) {
        const response = await this.productosService.updateProducto(
          this.editandoProductoId,
          this.nuevoProductoForm,
        );

        this.productos = this.productos.map((producto) =>
          producto._id === this.editandoProductoId ? response.producto : producto,
        );

        await Swal.fire({
          icon: 'success',
          title: 'Producto actualizado',
          text: 'Los cambios se guardaron correctamente en tu catálogo.',
          confirmButtonText: 'Continuar'
        });
      } else {
        const response = await this.productosService.createProducto(this.nuevoProductoForm);

        this.productos.push(response.producto);

        await Swal.fire({
          icon: 'success',
          title: 'Producto agregado',
          text: 'El producto fue agregado exitosamente a tu catálogo.',
          confirmButtonText: 'Continuar'
        });
      }

      this.cancelarFormulario();
    } catch (error: any) {
      await Swal.fire({
        icon: 'error',
        title: this.editandoProductoId ? 'Error al actualizar producto' : 'Error al agregar producto',
        text: error?.response?.data?.message || 'Ocurrió un problema al guardar el producto.',
        confirmButtonText: 'Entendido'
      });
    } finally {
      this.enviandoProducto = false;
    }
  }

  async actualizarDisponibilidad(producto: Producto, disponible: boolean): Promise<void> {
    try {
      const response = await this.productosService.updateProducto(producto._id, { disponible });

      const index = this.productos.findIndex(p => p._id === producto._id);
      if (index > -1) {
        this.productos[index] = response.producto;
      }

      await Swal.fire({
        icon: 'success',
        title: 'Disponibilidad actualizada',
        text: 'La disponibilidad del producto fue actualizada.',
        confirmButtonText: 'Continuar'
      });
    } catch (error: any) {
      await Swal.fire({
        icon: 'error',
        title: 'Error al actualizar',
        text: error?.response?.data?.message || 'Ocurrió un problema.',
        confirmButtonText: 'Entendido'
      });
    }
  }

  async eliminarProducto(productoId: string): Promise<void> {
    const result = await Swal.fire({
      icon: 'warning',
      title: '¿Eliminar producto?',
      text: 'Esta acción no se puede deshacer.',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#ef4444'
    });

    if (result.isConfirmed) {
      try {
        await this.productosService.deleteProducto(productoId);

        this.productos = this.productos.filter(p => p._id !== productoId);

        await Swal.fire({
          icon: 'success',
          title: 'Producto eliminado',
          text: 'El producto fue eliminado de tu catálogo.',
          confirmButtonText: 'Continuar'
        });
      } catch (error: any) {
        await Swal.fire({
          icon: 'error',
          title: 'Error al eliminar',
          text: error?.response?.data?.message || 'Ocurrió un problema.',
          confirmButtonText: 'Entendido'
        });
      }
    }
  }

  volver(): void {
    this.router.navigate(['/mi-cuenta']);
  }

  async onRegionRepartoChange(resetChildren = true): Promise<void> {
    if (resetChildren) {
      this.repartoForm.provinciaTienda = '';
      this.repartoForm.comunasRepartoTienda = [];
      this.comunasDisponibles = [];
    }

    this.provinciasDisponibles = [];

    if (!this.repartoForm.regionTienda) {
      return;
    }

    this.cargandoProvincias = true;

    try {
      this.provinciasDisponibles = await this.ubicacionesService.getUbicaciones(this.repartoForm.regionTienda);
    } finally {
      this.cargandoProvincias = false;
    }
  }

  async onProvinciaRepartoChange(resetComuna = true): Promise<void> {
    if (resetComuna) {
      this.repartoForm.comunasRepartoTienda = [];
    }

    this.comunasDisponibles = [];

    if (
      !this.repartoForm.regionTienda ||
      !this.repartoForm.provinciaTienda ||
      !this.provinciasDisponibles.includes(this.repartoForm.provinciaTienda)
    ) {
      return;
    }

    this.cargandoComunas = true;

    try {
      this.comunasDisponibles = await this.ubicacionesService.getUbicaciones(
        this.repartoForm.regionTienda,
        this.repartoForm.provinciaTienda,
      );
    } finally {
      this.cargandoComunas = false;
    }
  }

  isComunaRepartoSelected(comuna: string): boolean {
    return this.repartoForm.comunasRepartoTienda.includes(comuna);
  }

  toggleComunaReparto(comuna: string, checked: boolean): void {
    if (checked) {
      if (!this.repartoForm.comunasRepartoTienda.includes(comuna)) {
        this.repartoForm.comunasRepartoTienda = [
          ...this.repartoForm.comunasRepartoTienda,
          comuna,
        ];
      }

      return;
    }

    this.repartoForm.comunasRepartoTienda = this.repartoForm.comunasRepartoTienda
      .filter((item) => item !== comuna);
  }

  async guardarCoberturaReparto(): Promise<void> {
    this.guardandoCobertura = true;

    try {
      const comunaTienda =
        this.repartoForm.comunasRepartoTienda[0] ||
        this.repartoForm.comunaTienda ||
        '';

      const response = await this.usersService.registerStore({
        nombreTienda: this.user?.nombreTienda || '',
        descripcionTienda: this.user?.descripcionTienda || '',
        direccionTienda: this.user?.direccionTienda || '',
        telefonoTienda: this.user?.telefonoTienda || '',
        regionTienda: this.repartoForm.regionTienda,
        provinciaTienda: this.repartoForm.provinciaTienda,
        comunaTienda,
        categoriasTienda: Array.isArray(this.user?.categoriasTienda) ? this.user.categoriasTienda : [],
        comunasRepartoTienda: this.repartoForm.comunasRepartoTienda,
        aceptaContratoTienda: Boolean(this.user?.aceptaContratoTienda ?? true),
      });

      this.user = response.user;
      this.authService.setUser(response.user);
      this.repartoForm.comunaTienda = comunaTienda;

      await Swal.fire({
        icon: 'success',
        title: 'Cobertura actualizada',
        text: 'Las comunas de reparto de tu tienda fueron guardadas.',
        confirmButtonText: 'Continuar'
      });
    } catch (error: any) {
      await Swal.fire({
        icon: 'error',
        title: 'No se pudo guardar',
        text: error?.response?.data?.message || 'Ocurrio un problema al actualizar las comunas de reparto.',
        confirmButtonText: 'Entendido'
      });
    } finally {
      this.guardandoCobertura = false;
    }
  }

  async guardarDetallesTienda(): Promise<void> {
    this.guardandoDetalles = true;

    try {
      const horarioTienda = this.horarioForm.map((row) => ({
        dia: row.dia,
        abierto: row.abierto,
        apertura: row.abierto ? row.apertura : '',
        cierre: row.abierto ? row.cierre : '',
      }));

      const response = await this.usersService.updateStoreProfile({
        nombreTienda: this.detallesForm.nombreTienda.trim(),
        descripcionTienda: this.detallesForm.descripcionTienda.trim(),
        direccionTienda: this.detallesForm.direccionTienda.trim(),
        telefonoTienda: this.detallesForm.telefonoTienda.trim(),
        regionTienda: this.repartoForm.regionTienda,
        provinciaTienda: this.repartoForm.provinciaTienda,
        comunaTienda: this.repartoForm.comunasRepartoTienda[0] || this.repartoForm.comunaTienda,
        categoriasTienda: this.detallesForm.categoriasSeleccionadas,
        comunasRepartoTienda: this.repartoForm.comunasRepartoTienda,
        horarioTienda,
        imagenTienda: this.imagenTiendaBase64 ?? this.user?.imagenTienda ?? '',
      });

      this.user = response.user;
      this.authService.setUser(response.user);
      this.detallesForm.categoriaSeleccionada = '';
      this.detallesForm.categoriasSeleccionadas = Array.isArray(response.user?.categoriasTienda)
        ? [...response.user.categoriasTienda]
        : [];
      this.horarioForm = this.buildScheduleForm(response.user?.horarioTienda);
      this.imagenTiendaPreview = null;
      this.imagenTiendaBase64 = null;

      const fileInput = document.getElementById('store-image-input') as HTMLInputElement | null;
      if (fileInput) {
        fileInput.value = '';
      }

      await Swal.fire({
        icon: 'success',
        title: 'Tienda actualizada',
        text: 'Los detalles y horarios de tu tienda fueron guardados.',
        confirmButtonText: 'Continuar'
      });
    } catch (error: any) {
      await Swal.fire({
        icon: 'error',
        title: 'No se pudo actualizar la tienda',
        text: error?.response?.data?.message || 'Ocurrio un problema al guardar los detalles de la tienda.',
        confirmButtonText: 'Entendido'
      });
    } finally {
      this.guardandoDetalles = false;
    }
  }

  onHorarioToggle(row: StoreScheduleRow): void {
    if (row.abierto) {
      row.apertura = row.apertura || '09:00';
      row.cierre = row.cierre || '18:00';
      return;
    }

    row.apertura = '';
    row.cierre = '';
  }

  private async cargarRegionesReparto(): Promise<void> {
    this.cargandoRegiones = true;

    try {
      this.regionesDisponibles = await this.ubicacionesService.getUbicaciones();
    } finally {
      this.cargandoRegiones = false;
    }
  }

  private buildScheduleForm(
    schedule?: Array<{ dia: string; abierto: boolean; apertura?: string; cierre?: string }>
  ): StoreScheduleRow[] {
    return this.diasSemana.map((dia) => {
      const existing = schedule?.find((entry) => entry.dia === dia);

      return {
        dia,
        abierto: existing?.abierto ?? false,
        apertura: existing?.apertura ?? '',
        cierre: existing?.cierre ?? '',
      };
    });
  }

  private toDisplayImage(image?: string | null): string | null {
    if (!image?.trim()) {
      return null;
    }

    if (
      image.startsWith('data:') ||
      image.startsWith('http://') ||
      image.startsWith('https://')
    ) {
      return image;
    }

    return `data:image/jpeg;base64,${image}`;
  }

  private resetProductoImageInput(): void {
    const fileInput = document.getElementById('product-image-input') as HTMLInputElement | null;
    if (fileInput) {
      fileInput.value = '';
    }
  }
}
