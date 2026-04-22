import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { Pedido, PedidosService, ResumenCobrosTienda } from '../../../core/services/pedidos.service';

@Component({
  selector: 'app-cobros-tienda',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cobros-tienda.component.html',
  styleUrl: './cobros-tienda.component.css',
})
export class CobrosTiendaComponent {
  private readonly authService = inject(AuthService);
  private readonly pedidosService = inject(PedidosService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly clpFormatter = new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  });

  user = this.authService.getUser();
  cargandoCobros = false;
  procesandoPagoFlow = false;
  pedidos: Pedido[] = [];
  flowStatus: 'paid' | 'pending' | 'failed' | null = null;
  flowPedidoId: string | null = null;
  resumen: ResumenCobrosTienda = {
    cargoPorPedido: 1000,
    totalPagado: 0,
    totalAdeudado: 0,
    totalGenerado: 0,
    totalPedidosPagados: 0,
    totalPedidosAdeudados: 0,
    totalPedidosCanceladosSinCobro: 0,
  };

  async ngOnInit(): Promise<void> {
    this.flowStatus = this.readFlowStatusParam();
    this.flowPedidoId = this.route.snapshot.queryParamMap.get('pedidoId');
    await this.cargarCobros();
  }

  get nombreTienda(): string {
    return this.user?.nombreTienda || 'Mi tienda';
  }

  get tieneCobros(): boolean {
    return this.pedidos.length > 0;
  }

  get pedidosConDeuda(): Pedido[] {
    return this.pedidos.filter(
      (pedido) => pedido.estadoCobroSitio !== 'pagado' && pedido.estado !== 'cancelado',
    );
  }

  get pedidosPagados(): Pedido[] {
    return this.pedidos.filter((pedido) => pedido.estadoCobroSitio === 'pagado');
  }

  get puedePagarConFlow(): boolean {
    return this.resumen.totalAdeudado > 0 && !this.procesandoPagoFlow;
  }

  formatPrice(value: number): string {
    return this.clpFormatter.format(value || 0);
  }

  getPedidoNumeroCorto(pedido: Pedido): string {
    return pedido.numeroPedido || `PED-${pedido._id.slice(-6).toUpperCase()}`;
  }

  getCobroStatusClass(pedido: Pedido): string {
    return pedido.estadoCobroSitio === 'pagado' ? 'is-paid' : 'is-pending';
  }

  get flowMessage(): string {
    switch (this.flowStatus) {
      case 'paid':
        return 'Flow confirmó el pago y el cobro ya quedó regularizado.';
      case 'pending':
        return 'El pago quedó pendiente en Flow. Te avisaremos cuando se confirme.';
      case 'failed':
        return 'No se pudo confirmar el pago en Flow. Si el cobro persiste, vuelve a intentarlo.';
      default:
        return '';
    }
  }

  get flowMessageClass(): string {
    switch (this.flowStatus) {
      case 'paid':
        return 'is-success';
      case 'pending':
        return 'is-pending';
      case 'failed':
        return 'is-error';
      default:
        return '';
    }
  }

  volverAMiTienda(): void {
    this.router.navigate(['/mi-tienda']);
  }

  async pagarConFlow(): Promise<void> {
    if (!this.puedePagarConFlow) {
      return;
    }

    this.procesandoPagoFlow = true;

    try {
      const response = await this.pedidosService.createFlowCobroCheckout();

      if (!response?.checkoutUrl) {
        throw new Error('Flow no devolvió una URL de pago.');
      }

      window.location.href = response.checkoutUrl;
    } catch (error) {
      console.error('Error al iniciar pago con Flow:', error);
      this.procesandoPagoFlow = false;
    }
  }

  private async cargarCobros(): Promise<void> {
    this.cargandoCobros = true;

    try {
      const response = await this.pedidosService.getMisCobrosTienda();
      this.pedidos = response?.pedidos ?? [];
      this.resumen = response?.resumen ?? this.resumen;
      this.reconcileFlowReturnState();
    } catch (error) {
      console.error('Error al cargar cobros de tienda:', error);
      this.pedidos = [];
    } finally {
      this.cargandoCobros = false;
    }
  }

  private readFlowStatusParam(): 'paid' | 'pending' | 'failed' | null {
    const value = this.route.snapshot.queryParamMap.get('flowStatus');

    if (value === 'paid' || value === 'pending' || value === 'failed') {
      return value;
    }

    return null;
  }

  private reconcileFlowReturnState(): void {
    if (!this.flowPedidoId) {
      return;
    }

    const pedido = this.pedidos.find((item) => item._id === this.flowPedidoId);

    if (!pedido) {
      return;
    }

    if (pedido.estadoCobroSitio === 'pagado') {
      this.flowStatus = 'paid';
      return;
    }

    if (this.flowStatus === 'failed') {
      this.flowStatus = 'pending';
    }
  }
}
