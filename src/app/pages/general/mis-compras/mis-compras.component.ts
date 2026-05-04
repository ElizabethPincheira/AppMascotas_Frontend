import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { EstadoPedido, Pedido, PedidoItemPayload, PedidosService } from '../../../core/services/pedidos.service';

@Component({
  selector: 'app-mis-compras',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './mis-compras.component.html',
  styleUrls: ['./mis-compras.component.css']
})
export class MisComprasComponent {
  private readonly authService = inject(AuthService);
  private readonly pedidosService = inject(PedidosService);
  private readonly router = inject(Router);
  private readonly clpFormatter = new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  });

  user = this.authService.getUser();
  compras: Pedido[] = [];
  cargandoCompras = false;

  async ngOnInit(): Promise<void> {
    await this.cargarCompras();
  }

  get displayName(): string {
    return this.user?.nombre || 'Tu cuenta';
  }

  get tieneCompras(): boolean {
    return this.compras.length > 0;
  }

  getPedidoNumeroCorto(pedido: Pedido): string {
    return pedido.numeroPedido || `PED-${pedido._id.slice(-6).toUpperCase()}`;
  }

  getEstadoPedidoClass(estado: EstadoPedido): string {
    return estado
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-');
  }

  formatPrice(value: number): string {
    return this.clpFormatter.format(value);
  }

  formatCantidad(item: PedidoItemPayload): string {
    return `${item.cantidad} ${item.unidadVenta === 'kilo' ? 'kg' : 'u.'}`;
  }

  formatPrecioUnitario(item: PedidoItemPayload): string {
    return item.unidadVenta === 'kilo'
      ? `${this.formatPrice(item.precio)} / kg`
      : `${this.formatPrice(item.precio)} c/u`;
  }

  getImagenProducto(item: PedidoItemPayload): string | null {
    const image = item.imagen?.trim();

    if (!image) {
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

  getNombreTienda(pedido: Pedido): string {
    return pedido.tienda?.nombreTienda || pedido.nombreTienda || 'Tienda solidaria';
  }

  getDireccionTienda(pedido: Pedido): string {
    const tienda = pedido.tienda;

    return [
      tienda?.direccionTienda,
      tienda?.comunaTienda,
      tienda?.provinciaTienda,
      tienda?.regionTienda,
    ]
      .filter(Boolean)
      .join(', ');
  }

  volverAMiCuenta(): void {
    this.router.navigate(['/mi-cuenta']);
  }

  private async cargarCompras(): Promise<void> {
    this.cargandoCompras = true;

    try {
      this.compras = await this.pedidosService.getMisCompras();
    } catch (error) {
      console.error('Error al cargar compras:', error);
      this.compras = [];
    } finally {
      this.cargandoCompras = false;
    }
  }
}
