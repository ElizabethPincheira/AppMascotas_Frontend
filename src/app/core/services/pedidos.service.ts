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
  createdAt: string;
  updatedAt: string;
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

  async updatePedidoEstado(pedidoId: string, estado: EstadoPedido): Promise<Pedido> {
    const response = await axios.patch(
      this.apiUrl + `pedidos/${pedidoId}/estado`,
      { estado },
      { headers: this.authHeaders },
    );

    return response.data?.pedido;
  }
}
