import { Injectable } from '@angular/core';
import axios from 'axios';
import { environment } from '../../../environments/environment';
import { DeliveryStore, StoreProduct } from '../../pages/ecommer/tiendas/delivery-store.model';

export interface Store {
  _id: string;
  nombreTienda: string;
  descripcionTienda: string;
  direccionTienda: string;
  telefonoTienda: string;
  categoriasTienda: string[];
  region: string;
  provincia: string;
  comuna: string;
}

export interface BackendProducto {
  _id: string;
  tiendaId: string;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  imagen?: string;
  activo: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class TiendasService {
  private apiUrl = `${environment.apiUrl}`;
  private readonly fallbackImage = 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=1200&q=80';

  async getApprovedStores(): Promise<Store[]> {
    const response = await axios.get(this.apiUrl + 'user/stores/approved');
    return response.data.stores || [];
  }

  async getApprovedStoreById(storeId: string): Promise<Store | null> {
    try {
      const response = await axios.get(this.apiUrl + `user/stores/approved/${storeId}`);
      return response.data.store || null;
    } catch (error) {
      console.error('Error al obtener la tienda:', error);
      return null;
    }
  }

  async getPublicProductsByStore(storeId: string): Promise<BackendProducto[]> {
    try {
      const response = await axios.get(this.apiUrl + `productos/public/${storeId}`);
      return response.data.productos || [];
    } catch (error) {
      console.error('Error al obtener productos de la tienda:', error);
      return [];
    }
  }

  toDeliveryStore(store: Store, products: BackendProducto[] = []): DeliveryStore {
    return {
      id: store._id,
      slug: store.nombreTienda.toLowerCase().replace(/\s+/g, '-'),
      name: store.nombreTienda,
      slogan: store.descripcionTienda || 'Tienda registrada en Circulo Animal.',
      region: store.region,
      provincia: store.provincia,
      comuna: store.comuna,
      address: store.direccionTienda,
      eta: 'A coordinar con la tienda',
      schedule: 'Horario informado por la tienda',
      deliveryFee: 'Consultar',
      rating: 5,
      coverage: [store.comuna],
      categories: store.categoriasTienda || [],
      highlight: store.descripcionTienda || 'Conoce esta tienda registrada en la comunidad.',
      description: store.descripcionTienda || 'Esta tienda forma parte de la red de Circulo Animal.',
      heroImage: this.fallbackImage,
      gallery: [this.fallbackImage],
      products: products.map((product) => this.toStoreProduct(product)),
    };
  }

  private toStoreProduct(product: BackendProducto): StoreProduct {
    return {
      id: Number(product._id.replace(/\D/g, '').slice(-8) || '0'),
      name: product.nombre,
      category: 'Producto',
      price: new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        maximumFractionDigits: 0,
      }).format(product.precio),
      image: product.imagen || this.fallbackImage,
      description: product.descripcion,
      tags: [
        `Stock ${product.stock}`,
        product.activo ? 'Disponible' : 'No disponible',
      ],
    };
  }
}
