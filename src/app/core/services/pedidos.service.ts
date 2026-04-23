import { Injectable } from '@angular/core';
import axios from 'axios';
import { environment } from '../../../environments/environment';

export interface PedidoItemPayload {
  productoId: string;
  nombre: string;
  precio: number;
  imagen: string;
  cantidad: number;
}

export type EstadoPedido =
  | 'pendiente'
  | 'confirmado'
  | 'en camino'
  | 'entregado'
  | 'cancelado';

export type EstadoCobroSitio = 'pendiente' | 'pagado';
export type MetodoCobroSitio = 'flow' | 'transferencia' | null;

export interface PedidoCompradorPayload {
  nombreCompleto: string;
  email?: string;
  direccionEntrega: string;
  region: string;
  provincia: string;
  comuna: string;
  telefono: string;
  nota?: string;
}

export interface PedidoTiendaInfo {
  nombreTienda: string;
  telefonoTienda?: string;
  direccionTienda?: string;
  comunaTienda?: string;
  provinciaTienda?: string;
  regionTienda?: string;
}

export interface CrearPedidoPayload {
  items: PedidoItemPayload[];
  comprador: PedidoCompradorPayload;
  tiendaId: string;
  total: number;
  estado: 'pendiente';
}

export interface Pedido {
  _id: string;
  numeroPedido: string;
  tiendaId: string;
  nombreTienda: string;
  items: PedidoItemPayload[];
  comprador: PedidoCompradorPayload;
  total: number;
  estado: EstadoPedido;
  cargoServicioSitio: number;
  estadoCobroSitio: EstadoCobroSitio;
  fechaPagoCobroSitio?: string | null;
  metodoCobroSitio?: MetodoCobroSitio;
  transferenciaReportadaAt?: string | null;
  tienda?: PedidoTiendaInfo;
  createdAt: string;
  updatedAt: string;
}

export interface TransferenciaCobroInfo {
  configured: boolean;
  banco: string;
  titular: string;
  rut?: string;
  tipoCuenta: string;
  numeroCuenta: string;
  email?: string;
}

export interface ResumenCobrosTienda {
  cargoPorPedido: number;
  totalPagado: number;
  totalAdeudado: number;
  totalGenerado: number;
  totalPedidosPagados: number;
  totalPedidosAdeudados: number;
  totalPedidosCanceladosSinCobro: number;
  flowCommissionPercent?: number;
  flowCommissionVatPercent?: number;
  flowCommissionEffectivePercent?: number;
  flowComisionEstimada?: number;
  flowTotalAPagar?: number;
}

export interface CobrosMiTiendaResponse {
  tienda?: {
    _id: string;
    nombreTienda: string;
    email?: string;
  };
  transferencia?: TransferenciaCobroInfo;
  resumen: ResumenCobrosTienda;
  pedidos: Pedido[];
}

export interface CobroAdminTienda {
  tiendaId: string;
  tienda: {
    _id: string;
    nombre?: string;
    email?: string;
    nombreTienda: string;
    estadoSolicitudTienda?: string;
  };
  resumen: ResumenCobrosTienda;
  pedidos: Pedido[];
}

export interface CobrosAdminResponse {
  resumenGeneral: ResumenCobrosTienda;
  tiendas: CobroAdminTienda[];
}

@Injectable({
  providedIn: 'root'
})
export class PedidosService {
  private apiUrl = `${environment.apiUrl}`;
  private get authHeaders() {
    return {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };
  }

  async crearPedido(payload: CrearPedidoPayload): Promise<any> {
    const response = await axios.post(this.apiUrl + 'pedidos', payload, {
      headers: this.authHeaders,
    });

    return response.data;
  }

  async getPedidosByTienda(tiendaId: string): Promise<Pedido[]> {
    const response = await axios.get(this.apiUrl + `pedidos/tienda/${tiendaId}`, {
      headers: this.authHeaders,
    });

    return response.data?.pedidos ?? [];
  }

  async getMisCompras(): Promise<Pedido[]> {
    const response = await axios.get(this.apiUrl + 'pedidos/mis-compras', {
      headers: this.authHeaders,
    });

    return response.data?.pedidos ?? [];
  }

  async updatePedidoEstado(pedidoId: string, estado: EstadoPedido): Promise<Pedido> {
    const response = await axios.patch(
      this.apiUrl + `pedidos/${pedidoId}/estado`,
      { estado },
      { headers: this.authHeaders },
    );

    return response.data?.pedido;
  }

  async getMisCobrosTienda(): Promise<CobrosMiTiendaResponse> {
    const response = await axios.get(this.apiUrl + 'pedidos/mi-tienda/cobros', {
      headers: this.authHeaders,
    });

    return {
      tienda: response.data?.tienda,
      transferencia: response.data?.transferencia,
      resumen: response.data?.resumen,
      pedidos: response.data?.pedidos ?? [],
    };
  }

  async getAdminCobrosTiendas(): Promise<CobrosAdminResponse> {
    const response = await axios.get(this.apiUrl + 'pedidos/admin/cobros-tiendas', {
      headers: this.authHeaders,
    });

    return {
      resumenGeneral: response.data?.resumenGeneral,
      tiendas: response.data?.tiendas ?? [],
    };
  }

  async updateCobroSitio(
    pedidoId: string,
    estadoCobroSitio: EstadoCobroSitio,
  ): Promise<Pedido> {
    const response = await axios.patch(
      this.apiUrl + `pedidos/${pedidoId}/cobro-sitio`,
      { estadoCobroSitio },
      { headers: this.authHeaders },
    );

    return response.data?.pedido;
  }

  async createFlowCobroCheckout(): Promise<{
    checkoutUrl: string;
    resumenPago?: {
      subtotalAdeudado: number;
      porcentajeBase: number;
      porcentajeIva: number;
      porcentajeEfectivo: number;
      comisionFlow: number;
      totalConComision: number;
    };
    pedidos?: Pedido[];
  }> {
    const response = await axios.post(
      this.apiUrl + 'pedidos/mi-tienda/cobros/flow',
      {},
      { headers: this.authHeaders },
    );

    return {
      checkoutUrl: response.data?.checkoutUrl,
      resumenPago: response.data?.resumenPago,
      pedidos: response.data?.pedidos ?? [],
    };
  }

  async reportTransferenciaCobro(): Promise<{
    message: string;
    transferencia?: TransferenciaCobroInfo;
    pedidos?: Pedido[];
  }> {
    const response = await axios.post(
      this.apiUrl + 'pedidos/mi-tienda/cobros/transferencia',
      {},
      { headers: this.authHeaders },
    );

    return {
      message: response.data?.message,
      transferencia: response.data?.transferencia,
      pedidos: response.data?.pedidos ?? [],
    };
  }
}
