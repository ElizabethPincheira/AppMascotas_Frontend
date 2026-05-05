import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CarritoItem, CarritoService } from '../../../core/services/carrito.service';
import {
  CrearPedidoPayload,
  PedidosService,
} from '../../../core/services/pedidos.service';
import { UbicacionesService } from '../../../core/services/ubicaciones.service';

type CheckoutStep = 1 | 2 | 3;

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent {
  private readonly authService = inject(AuthService);
  private readonly carritoService = inject(CarritoService);
  private readonly ubicacionesService = inject(UbicacionesService);
  private readonly pedidosService = inject(PedidosService);
  private readonly router = inject(Router);
  private readonly clpFormatter = new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  });

  readonly costoEnvioLabel = 'A coordinar con la tienda';
  readonly items = this.carritoService.items;

  user = this.authService.getUser();
  pasoActual: CheckoutStep = 1;
  regiones: string[] = [];
  provincias: string[] = [];
  comunas: string[] = [];
  cargandoRegiones = false;
  cargandoProvincias = false;
  cargandoComunas = false;
  procesandoPedido = false;
  pedidoExitoso = false;
  errorPedido = '';
  numeroPedido = '';

  aceptacionCoordinacion = false;

  deliveryForm = {
    nombreCompleto: this.user?.nombre || '',
    direccionEntrega: '',
    region: this.user?.region || '',
    provincia: this.user?.provincia || '',
    comuna: this.user?.comuna || '',
    telefono: this.user?.telefono || '',
    nota: '',
  };

  async ngOnInit(): Promise<void> {
    if (!this.items.length) {
      return;
    }

    await this.cargarRegiones();

    if (this.deliveryForm.region) {
      await this.onRegionChange(false);
    }

    if (this.deliveryForm.provincia && this.provincias.includes(this.deliveryForm.provincia)) {
      await this.onProvinciaChange(false);
    } else if (this.deliveryForm.provincia) {
      this.deliveryForm.provincia = '';
      this.deliveryForm.comuna = '';
    }
  }

  get nombreTienda(): string {
    return this.carritoService.nombreTienda || 'Tienda solidaria';
  }

  get total(): number {
    return this.carritoService.total;
  }

  get cantidadTotal(): number {
    return this.carritoService.cantidadTotal;
  }

  get tiendaId(): string {
    return this.carritoService.tiendaId || '';
  }

  formatPrice(value: number): string {
    return this.clpFormatter.format(value);
  }

  get datosEntregaCompletos(): boolean {
    return !!(
      this.deliveryForm.nombreCompleto.trim() &&
      this.deliveryForm.direccionEntrega.trim() &&
      this.deliveryForm.region &&
      this.deliveryForm.provincia &&
      this.deliveryForm.comuna &&
      this.deliveryForm.telefono.trim()
    );
  }

  get puedeAvanzarResumen(): boolean {
    return this.aceptacionCoordinacion && this.items.length > 0;
  }

  get payloadPedido(): CrearPedidoPayload {
    return {
      items: this.items.map((item) => ({
        productoId: item.productoId,
        nombre: item.nombre,
        precio: item.precio,
        imagen: item.imagen,
        cantidad: item.cantidad,
        unidadVenta: item.unidadVenta,
      })),
      comprador: {
        nombreCompleto: this.deliveryForm.nombreCompleto.trim(),
        direccionEntrega: this.deliveryForm.direccionEntrega.trim(),
        region: this.deliveryForm.region,
        provincia: this.deliveryForm.provincia,
        comuna: this.deliveryForm.comuna,
        telefono: this.deliveryForm.telefono.trim(),
        nota: this.deliveryForm.nota.trim(),
      },
      tiendaId: this.tiendaId,
      total: this.total,
      estado: 'pendiente',
    };
  }

  trackByProductoId(_: number, item: CarritoItem): string {
    return item.itemId || `${item.productoId}-${item.unidadVenta || 'unidad'}`;
  }

  getUnitLabel(item: CarritoItem): string {
    return item.unidadVenta === 'kilo' ? 'kg' : 'u.';
  }

  getPriceLabel(item: CarritoItem): string {
    return item.unidadVenta === 'kilo'
      ? `${this.formatPrice(item.precio)} / kg`
      : `${this.formatPrice(item.precio)} c/u`;
  }

  siguientePaso(): void {
    if (this.pasoActual === 1 && this.datosEntregaCompletos) {
      this.pasoActual = 2;
      return;
    }

    if (this.pasoActual === 2 && this.puedeAvanzarResumen) {
      this.pasoActual = 3;
    }
  }

  volverPaso(): void {
    if (this.pasoActual > 1) {
      this.pasoActual = (this.pasoActual - 1) as CheckoutStep;
    }
  }

  async onRegionChange(resetChildren = true): Promise<void> {
    if (resetChildren) {
      this.deliveryForm.provincia = '';
      this.deliveryForm.comuna = '';
      this.comunas = [];
    }

    this.provincias = [];

    if (!this.deliveryForm.region) {
      return;
    }

    this.cargandoProvincias = true;

    try {
      this.provincias = await this.ubicacionesService.getUbicaciones(this.deliveryForm.region);
    } finally {
      this.cargandoProvincias = false;
    }
  }

  async onProvinciaChange(resetComuna = true): Promise<void> {
    if (resetComuna) {
      this.deliveryForm.comuna = '';
    }

    this.comunas = [];

    if (!this.deliveryForm.region || !this.deliveryForm.provincia) {
      return;
    }

    this.cargandoComunas = true;

    try {
      this.comunas = await this.ubicacionesService.getUbicaciones(
        this.deliveryForm.region,
        this.deliveryForm.provincia,
      );
    } finally {
      this.cargandoComunas = false;
    }
  }

  async confirmarPedido(): Promise<void> {
    if (!this.items.length || !this.tiendaId) {
      this.errorPedido = 'Tu carrito esta vacio. Agrega productos antes de continuar.';
      return;
    }

    this.procesandoPedido = true;
    this.errorPedido = '';

    try {
      const response = await this.pedidosService.crearPedido(this.payloadPedido);
      const pedido = response?.pedido;

      this.numeroPedido = pedido?.numeroPedido || pedido?._id || '';
      this.carritoService.vaciarCarrito();
      this.pedidoExitoso = true;
    } catch (error: any) {
      this.errorPedido = error?.response?.data?.message
        || 'No pudimos crear tu pedido por ahora. Intenta nuevamente en unos minutos.';
    } finally {
      this.procesandoPedido = false;
    }
  }

  irATiendas(): void {
    this.router.navigate(['/tiendas']);
  }

  private async cargarRegiones(): Promise<void> {
    this.cargandoRegiones = true;

    try {
      this.regiones = await this.ubicacionesService.getUbicaciones();
    } finally {
      this.cargandoRegiones = false;
    }
  }
}
