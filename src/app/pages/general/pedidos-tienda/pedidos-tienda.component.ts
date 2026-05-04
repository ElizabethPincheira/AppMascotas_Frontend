import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../../../core/services/auth.service';
import { EstadoPedido, Pedido, PedidoItemPayload, PedidosService } from '../../../core/services/pedidos.service';

@Component({
  selector: 'app-pedidos-tienda',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './pedidos-tienda.component.html',
  styleUrls: ['./pedidos-tienda.component.css']
})
export class PedidosTiendaComponent {
  private readonly authService = inject(AuthService);
  private readonly pedidosService = inject(PedidosService);
  private readonly router = inject(Router);
  private readonly clpFormatter = new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  });

  user = this.authService.getUser();
  pedidos: Pedido[] = [];
  cargandoPedidos = false;
  actualizandoPedidoId: string | null = null;
  readonly estadosPedidoDisponibles: EstadoPedido[] = [
    'pendiente',
    'confirmado',
    'en camino',
    'entregado',
    'cancelado',
  ];
  pedidoEstadosForm: Record<string, EstadoPedido> = {};

  async ngOnInit(): Promise<void> {
    await this.cargarPedidos();
  }

  get nombreTienda(): string {
    return this.user?.nombreTienda || 'Mi tienda';
  }

  get tienePedidos(): boolean {
    return this.pedidos.length > 0;
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

  getTotalItems(pedido: Pedido): number {
    return pedido.items.reduce((sum, item) => sum + Number(item.cantidad || 0), 0);
  }

  getItemsPreview(pedido: Pedido): string {
    const preview = pedido.items
      .slice(0, 2)
      .map((item) => `${item.nombre} x${this.formatCantidad(item)}`)
      .join(' · ');

    if (pedido.items.length <= 2) {
      return preview;
    }

    return `${preview} · +${pedido.items.length - 2} más`;
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

  async actualizarEstadoPedido(pedido: Pedido): Promise<void> {
    const nuevoEstado = this.pedidoEstadosForm[pedido._id];

    if (!nuevoEstado || nuevoEstado === pedido.estado) {
      return;
    }

    this.actualizandoPedidoId = pedido._id;

    try {
      const pedidoActualizado = await this.pedidosService.updatePedidoEstado(pedido._id, nuevoEstado);
      this.pedidos = this.pedidos.map((item) => item._id === pedido._id ? pedidoActualizado : item);
      this.pedidoEstadosForm[pedido._id] = pedidoActualizado.estado;

      await Swal.fire({
        icon: 'success',
        title: 'Pedido actualizado',
        text: 'El estado del pedido fue guardado correctamente.',
        confirmButtonText: 'Continuar'
      });
    } catch (error: any) {
      this.pedidoEstadosForm[pedido._id] = pedido.estado;

      await Swal.fire({
        icon: 'error',
        title: 'No se pudo actualizar el pedido',
        text: error?.response?.data?.message || 'Ocurrio un problema al guardar el nuevo estado.',
        confirmButtonText: 'Entendido'
      });
    } finally {
      this.actualizandoPedidoId = null;
    }
  }

  volverAMiTienda(): void {
    this.router.navigate(['/mi-tienda']);
  }

  private async cargarPedidos(): Promise<void> {
    if (!this.user?._id) {
      this.pedidos = [];
      return;
    }

    this.cargandoPedidos = true;

    try {
      this.pedidos = await this.pedidosService.getPedidosByTienda(this.user._id);
      this.pedidoEstadosForm = this.pedidos.reduce((acc, pedido) => {
        acc[pedido._id] = pedido.estado;
        return acc;
      }, {} as Record<string, EstadoPedido>);
    } catch (error) {
      console.error('Error al cargar pedidos:', error);
      this.pedidos = [];
      this.pedidoEstadosForm = {};
    } finally {
      this.cargandoPedidos = false;
    }
  }
}
