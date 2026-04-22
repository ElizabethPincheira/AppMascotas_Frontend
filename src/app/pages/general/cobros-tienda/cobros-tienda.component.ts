import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
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
  private readonly clpFormatter = new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  });

  user = this.authService.getUser();
  cargandoCobros = false;
  pedidos: Pedido[] = [];
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

  formatPrice(value: number): string {
    return this.clpFormatter.format(value || 0);
  }

  getPedidoNumeroCorto(pedido: Pedido): string {
    return pedido.numeroPedido || `PED-${pedido._id.slice(-6).toUpperCase()}`;
  }

  getCobroStatusClass(pedido: Pedido): string {
    return pedido.estadoCobroSitio === 'pagado' ? 'is-paid' : 'is-pending';
  }

  volverAMiTienda(): void {
    this.router.navigate(['/mi-tienda']);
  }

  private async cargarCobros(): Promise<void> {
    this.cargandoCobros = true;

    try {
      const response = await this.pedidosService.getMisCobrosTienda();
      this.pedidos = response?.pedidos ?? [];
      this.resumen = response?.resumen ?? this.resumen;
    } catch (error) {
      console.error('Error al cargar cobros de tienda:', error);
      this.pedidos = [];
    } finally {
      this.cargandoCobros = false;
    }
  }
}
