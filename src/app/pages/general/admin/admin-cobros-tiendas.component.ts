import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
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
  imports: [CommonModule, FormsModule, RouterLink],
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
  filtroAnio = '';
  filtroMes = '';
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
    return this.tiendasFiltradas.filter((tienda) => tienda.resumen.totalAdeudado > 0).length;
  }

  get hayFiltrosActivos(): boolean {
    return !!this.filtroAnio || !!this.filtroMes;
  }

  get resumenGeneralFiltrado(): ResumenCobrosTienda {
    return this.buildChargeSummary(this.tiendasFiltradas.flatMap((tienda) => tienda.pedidos));
  }

  get aniosDisponibles(): string[] {
    const years = new Set<string>();

    this.tiendas.forEach((tienda) => {
      tienda.pedidos.forEach((pedido) => {
        const date = new Date(pedido.createdAt);

        if (!Number.isNaN(date.getTime())) {
          years.add(String(date.getFullYear()));
        }
      });
    });

    return [...years].sort((a, b) => Number(b) - Number(a));
  }

  get mesesDisponibles(): Array<{ value: string; label: string }> {
    return [
      { value: '1', label: 'Enero' },
      { value: '2', label: 'Febrero' },
      { value: '3', label: 'Marzo' },
      { value: '4', label: 'Abril' },
      { value: '5', label: 'Mayo' },
      { value: '6', label: 'Junio' },
      { value: '7', label: 'Julio' },
      { value: '8', label: 'Agosto' },
      { value: '9', label: 'Septiembre' },
      { value: '10', label: 'Octubre' },
      { value: '11', label: 'Noviembre' },
      { value: '12', label: 'Diciembre' },
    ];
  }

  get tiendasFiltradas(): CobroAdminTienda[] {
    return this.tiendas
      .map((tienda) => {
        const pedidos = tienda.pedidos.filter((pedido) => this.matchesDateFilter(pedido));

        return {
          ...tienda,
          pedidos,
          resumen: this.buildChargeSummary(pedidos),
        };
      })
      .filter((tienda) => tienda.pedidos.length > 0);
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

  getMetodoCobroLabel(pedido: Pedido): string {
    if (pedido.estadoCobroSitio === 'pagado' && pedido.metodoCobroSitio === 'flow') {
      return 'Flow';
    }

    if (pedido.metodoCobroSitio === 'transferencia') {
      return 'Transferencia';
    }

    if (pedido.metodoCobroSitio === 'flow') {
      return 'Flow pendiente';
    }

    return 'Sin informar';
  }

  trackByStoreId(_: number, tienda: CobroAdminTienda): string {
    return tienda.tiendaId;
  }

  trackByPedidoId(_: number, pedido: Pedido): string {
    return pedido._id;
  }

  limpiarFiltros(): void {
    this.filtroAnio = '';
    this.filtroMes = '';
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

  private matchesDateFilter(pedido: Pedido): boolean {
    const date = new Date(pedido.createdAt);

    if (Number.isNaN(date.getTime())) {
      return !this.hayFiltrosActivos;
    }

    const matchesYear = !this.filtroAnio || String(date.getFullYear()) === this.filtroAnio;
    const matchesMonth = !this.filtroMes || String(date.getMonth() + 1) === this.filtroMes;

    return matchesYear && matchesMonth;
  }

  private buildChargeSummary(pedidos: Pedido[]): ResumenCobrosTienda {
    const cargoPorPedido = this.resumenGeneral.cargoPorPedido || 1000;
    const pedidosPagados = pedidos.filter((pedido) => pedido.estadoCobroSitio === 'pagado');
    const pedidosAdeudados = pedidos.filter(
      (pedido) => pedido.estadoCobroSitio !== 'pagado' && pedido.estado !== 'cancelado',
    );
    const pedidosCancelados = pedidos.filter(
      (pedido) => pedido.estado === 'cancelado' && pedido.estadoCobroSitio !== 'pagado',
    );

    const totalPagado = pedidosPagados.reduce(
      (sum, pedido) => sum + Number(pedido.cargoServicioSitio || cargoPorPedido),
      0,
    );
    const totalAdeudado = pedidosAdeudados.reduce(
      (sum, pedido) => sum + Number(pedido.cargoServicioSitio || cargoPorPedido),
      0,
    );

    return {
      cargoPorPedido,
      totalPagado,
      totalAdeudado,
      totalGenerado: totalPagado + totalAdeudado,
      totalPedidosPagados: pedidosPagados.length,
      totalPedidosAdeudados: pedidosAdeudados.length,
      totalPedidosCanceladosSinCobro: pedidosCancelados.length,
    };
  }
}
