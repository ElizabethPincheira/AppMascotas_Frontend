import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import {
  CobroAdminTienda,
  EstadoCobroSitio,
  Pedido,
  PedidosService,
  ResumenCobrosTienda,
} from '../../../core/services/pedidos.service';

@Component({
  selector: 'app-admin-cobros-tiendas',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-cobros-tiendas.component.html',
  styleUrl: './admin-cobros-tiendas.component.css',
})
export class AdminCobrosTiendasComponent {
  private readonly pedidosService = inject(PedidosService);
  private readonly clpFormatter = new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  });

  cargandoCobros = true;
  procesandoPedidoId: string | null = null;
  resumenGeneral: ResumenCobrosTienda = {
    cargoPorPedido: 1000,
    totalPagado: 0,
    totalAdeudado: 0,
    totalGenerado: 0,
    totalPedidosPagados: 0,
    totalPedidosAdeudados: 0,
    totalPedidosCanceladosSinCobro: 0,
  };
  tiendas: CobroAdminTienda[] = [];

  async ngOnInit(): Promise<void> {
    await this.cargarCobros();
  }

  get totalTiendasConDeuda(): number {
    return this.tiendas.filter((tienda) => tienda.resumen.totalAdeudado > 0).length;
  }

  formatPrice(value: number): string {
    return this.clpFormatter.format(value || 0);
  }

  getPedidoNumeroCorto(pedido: Pedido): string {
    return pedido.numeroPedido || `PED-${pedido._id.slice(-6).toUpperCase()}`;
  }

  getCobroStatusClass(estado: EstadoCobroSitio): string {
    return estado === 'pagado' ? 'is-paid' : 'is-pending';
  }

  trackByStoreId(_: number, tienda: CobroAdminTienda): string {
    return tienda.tiendaId;
  }

  trackByPedidoId(_: number, pedido: Pedido): string {
    return pedido._id;
  }

  async actualizarCobro(pedido: Pedido, nuevoEstado: EstadoCobroSitio): Promise<void> {
    if (this.procesandoPedidoId === pedido._id || pedido.estadoCobroSitio === nuevoEstado) {
      return;
    }

    this.procesandoPedidoId = pedido._id;

    try {
      await this.pedidosService.updateCobroSitio(pedido._id, nuevoEstado);
      await this.cargarCobros();

      await Swal.fire({
        icon: 'success',
        title: nuevoEstado === 'pagado' ? 'Cobro marcado como pagado' : 'Cobro marcado como pendiente',
        text: 'El resumen financiero ya fue actualizado.',
        confirmButtonText: 'Continuar',
      });
    } catch (error: any) {
      await Swal.fire({
        icon: 'error',
        title: 'No se pudo actualizar el cobro',
        text: error?.response?.data?.message || 'Ocurrió un problema al guardar el cambio.',
        confirmButtonText: 'Entendido',
      });
    } finally {
      this.procesandoPedidoId = null;
    }
  }

  private async cargarCobros(): Promise<void> {
    this.cargandoCobros = true;

    try {
      const response = await this.pedidosService.getAdminCobrosTiendas();
      this.resumenGeneral = response?.resumenGeneral ?? this.resumenGeneral;
      this.tiendas = response?.tiendas ?? [];
    } finally {
      this.cargandoCobros = false;
    }
  }
}
