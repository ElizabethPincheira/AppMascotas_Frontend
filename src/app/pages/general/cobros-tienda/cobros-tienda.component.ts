import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import {
  Pedido,
  PedidosService,
  ResumenCobrosTienda,
  TransferenciaCobroInfo,
} from '../../../core/services/pedidos.service';

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
  procesandoTransferencia = false;
  pedidos: Pedido[] = [];
  flowStatus: 'paid' | 'pending' | 'failed' | null = null;
  flowPedidoId: string | null = null;
  transferenciaMensaje = '';
  transferenciaMensajeTipo: 'success' | 'warning' | 'error' | null = null;
  transferenciaInfo: TransferenciaCobroInfo = {
    configured: false,
    banco: '',
    titular: '',
    rut: '',
    tipoCuenta: '',
    numeroCuenta: '',
    email: '',
  };
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

  get puedePagarPorTransferencia(): boolean {
    return this.resumen.totalAdeudado > 0 && this.transferenciaInfo.configured && !this.procesandoTransferencia;
  }

  get transferenciaPendienteInformada(): boolean {
    return this.pedidosConDeuda.some(
      (pedido) => pedido.metodoCobroSitio === 'transferencia' && !!pedido.transferenciaReportadaAt,
    );
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

  get transferenciaMessageClass(): string {
    switch (this.transferenciaMensajeTipo) {
      case 'success':
        return 'is-success';
      case 'warning':
        return 'is-pending';
      case 'error':
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

  async informarTransferencia(): Promise<void> {
    if (!this.puedePagarPorTransferencia) {
      return;
    }

    this.procesandoTransferencia = true;

    try {
      const response = await this.pedidosService.reportTransferenciaCobro();
      this.transferenciaMensaje =
        response?.message ||
        'Transferencia informada correctamente. Quedará pendiente hasta validación del administrador.';
      this.transferenciaMensajeTipo = 'success';
      await this.cargarCobros();
    } catch (error: any) {
      console.error('Error al informar transferencia:', error);
      this.transferenciaMensaje =
        error?.response?.data?.message ||
        'No se pudo informar la transferencia. Intenta nuevamente en unos segundos.';
      this.transferenciaMensajeTipo = 'error';
    } finally {
      this.procesandoTransferencia = false;
    }
  }

  async copiarDatosTransferencia(): Promise<void> {
    if (!this.transferenciaInfo.configured) {
      return;
    }

    try {
      await navigator.clipboard.writeText(this.getTransferenciaClipboardText());
      this.transferenciaMensaje = 'Datos de transferencia copiados correctamente.';
      this.transferenciaMensajeTipo = 'success';
    } catch (error) {
      console.error('Error al copiar datos de transferencia:', error);
      this.transferenciaMensaje = 'No se pudieron copiar los datos de transferencia.';
      this.transferenciaMensajeTipo = 'error';
    }
  }

  getMetodoCobroLabel(pedido: Pedido): string {
    if (pedido.estadoCobroSitio === 'pagado' && pedido.metodoCobroSitio === 'flow') {
      return 'Pagado vía Flow';
    }

    if (pedido.metodoCobroSitio === 'transferencia' && pedido.transferenciaReportadaAt) {
      return 'Transferencia informada';
    }

    if (pedido.metodoCobroSitio === 'flow') {
      return 'Pendiente en Flow';
    }

    return 'Sin método informado';
  }

  private async cargarCobros(): Promise<void> {
    this.cargandoCobros = true;

    try {
      const response = await this.pedidosService.getMisCobrosTienda();
      this.pedidos = response?.pedidos ?? [];
      this.transferenciaInfo = response?.transferencia ?? this.transferenciaInfo;
      this.resumen = response?.resumen ?? this.resumen;
      this.reconcileFlowReturnState();
      this.reconcileTransferState();
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

  private getTransferenciaClipboardText(): string {
    const lines = [
      `Banco: ${this.transferenciaInfo.banco}`,
      `Titular: ${this.transferenciaInfo.titular}`,
      this.transferenciaInfo.rut ? `RUT: ${this.transferenciaInfo.rut}` : '',
      `Tipo de cuenta: ${this.transferenciaInfo.tipoCuenta}`,
      `Numero de cuenta: ${this.transferenciaInfo.numeroCuenta}`,
      this.transferenciaInfo.email ? `Correo: ${this.transferenciaInfo.email}` : '',
      `Monto a transferir: ${this.formatPrice(this.resumen.totalAdeudado)}`,
    ].filter(Boolean);

    return lines.join('\n');
  }

  private reconcileTransferState(): void {
    if (this.transferenciaMensaje) {
      return;
    }

    if (this.transferenciaPendienteInformada) {
      this.transferenciaMensaje =
        'Ya informaste una transferencia. El pago seguirá pendiente hasta que el administrador la valide.';
      this.transferenciaMensajeTipo = 'warning';
    }
  }
}
