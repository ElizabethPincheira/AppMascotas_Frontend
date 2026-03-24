import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../../../core/services/auth.service';
import { ProductosService, Producto, CreateProductoDto } from '../../../core/services/productos.service';

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
  private readonly productosService = inject(ProductosService);

  user = this.authService.getUser();
  productos: Producto[] = [];
  cargandoProductos = false;
  mostrarFormulario = false;
  enviandoProducto = false;
  editandoProductoId: string | null = null;
  imagenPreview: string | null = null;
  comprimiendoImagen = false;

  nuevoProductoForm: CreateProductoDto = {
    nombre: '',
    descripcion: '',
    precio: 0,
    stock: 0,
  };

  async ngOnInit(): Promise<void> {
    await this.cargarProductos();
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

  get categoriasTienda(): string[] {
    return Array.isArray(this.user?.categoriasTienda) ? this.user.categoriasTienda : [];
  }

  get comunasRepartoTienda(): string[] {
    return Array.isArray(this.user?.comunasRepartoTienda) ? this.user.comunasRepartoTienda : [];
  }

  get estadoTienda(): string {
    return this.user?.estadoSolicitudTienda || 'ninguna';
  }

  get formularioValido(): boolean {
    return !!(
      this.nuevoProductoForm.nombre.trim() &&
      this.nuevoProductoForm.descripcion.trim() &&
      this.nuevoProductoForm.precio > 0 &&
      this.nuevoProductoForm.stock >= 0
    );
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
      stock: 0,
    };
    this.imagenPreview = null;
  }

  async onImagenSeleccionada(event: any): Promise<void> {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
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
    }
  }

  removerImagen(): void {
    this.imagenPreview = null;
    this.nuevoProductoForm.imagen = undefined;
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  async agregarProducto(): Promise<void> {
    this.enviandoProducto = true;

    try {
      const response = await this.productosService.createProducto(this.nuevoProductoForm);

      this.productos.push(response.producto);

      await Swal.fire({
        icon: 'success',
        title: 'Producto agregado',
        text: 'El producto fue agregado exitosamente a tu catálogo.',
        confirmButtonText: 'Continuar'
      });

      this.cancelarFormulario();
    } catch (error: any) {
      await Swal.fire({
        icon: 'error',
        title: 'Error al agregar producto',
        text: error?.response?.data?.message || 'Ocurrió un problema al agregar el producto.',
        confirmButtonText: 'Entendido'
      });
    } finally {
      this.enviandoProducto = false;
    }
  }

  async actualizarStock(producto: Producto, nuevoStock: number): Promise<void> {
    try {
      const response = await this.productosService.updateProducto(producto._id, { stock: nuevoStock });

      const index = this.productos.findIndex(p => p._id === producto._id);
      if (index > -1) {
        this.productos[index] = response.producto;
      }

      await Swal.fire({
        icon: 'success',
        title: 'Stock actualizado',
        text: 'El stock del producto fue actualizado.',
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
}
