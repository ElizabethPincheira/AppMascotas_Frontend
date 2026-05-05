import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CarritoItem, CarritoService } from '../../../core/services/carrito.service';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './carrito.component.html',
  styleUrls: ['./carrito.component.css']
})
export class CarritoComponent {
  readonly carritoService = inject(CarritoService);
  readonly items$ = this.carritoService.items$;
  readonly costoEnvioLabel = 'A coordinar con la tienda';
  private readonly clpFormatter = new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  });

  trackByProductoId(_: number, item: CarritoItem): string {
    return item.itemId || `${item.productoId}-${item.unidadVenta || 'unidad'}`;
  }

  aumentarCantidad(item: CarritoItem): void {
    this.carritoService.cambiarCantidad(item.itemId || `${item.productoId}-${item.unidadVenta || 'unidad'}`, item.cantidad + 1);
  }

  disminuirCantidad(item: CarritoItem): void {
    this.carritoService.cambiarCantidad(item.itemId || `${item.productoId}-${item.unidadVenta || 'unidad'}`, item.cantidad - 1);
  }

  get nombreTienda(): string {
    return this.carritoService.nombreTienda || 'Tu tienda seleccionada';
  }

  formatPrice(value: number): string {
    return this.clpFormatter.format(value);
  }

  getUnitLabel(item: CarritoItem): string {
    return item.unidadVenta === 'kilo' ? 'kg' : 'u.';
  }

  getPriceLabel(item: CarritoItem): string {
    return item.unidadVenta === 'kilo'
      ? `${this.formatPrice(item.precio)} / kg`
      : `${this.formatPrice(item.precio)} c/u`;
  }
}
