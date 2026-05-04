import { Injectable } from '@angular/core';
import axios from 'axios';
import { environment } from '../../../environments/environment';
import { DeliveryStore, StoreProduct, StoreScheduleEntry } from '../../pages/ecommer/tiendas/delivery-store.model';

export interface Store {
  _id: string;
  nombre?: string;
  email?: string;
  nombreTienda: string;
  descripcionTienda: string;
  direccionTienda: string;
  telefonoTienda: string;
  imagenTienda?: string;
  categoriasTienda: string[];
  comunasRepartoTienda?: string[];
  horarioTienda?: Array<{
    dia: string;
    abierto: boolean;
    apertura?: string;
    cierre?: string;
  }>;
  regionTienda?: string;
  provinciaTienda?: string;
  comunaTienda?: string;
  estadoSolicitudTienda?: string;
  fechaSolicitudTienda?: string;
  motivoRechazoTienda?: string;
  region?: string;
  provincia?: string;
  comuna?: string;
}

export interface BackendProducto {
  _id: string;
  tiendaId: string;
  nombre: string;
  descripcion: string;
  precio: number;
  unidadVenta?: 'unidad' | 'kilo';
  stock?: number;
  disponible?: boolean;
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

  async getAdminStoreById(storeId: string): Promise<Store | null> {
    const token = localStorage.getItem('token');

    if (!token) {
      return null;
    }

    try {
      const response = await axios.get(this.apiUrl + `user/admin/stores/${storeId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.store || null;
    } catch (error) {
      console.error('Error al obtener la tienda para admin:', error);
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
    const storeImage = this.toDisplayImage(store.imagenTienda?.trim()) || this.fallbackImage;

    return {
      id: store._id,
      slug: store.nombreTienda.toLowerCase().replace(/\s+/g, '-'),
      name: store.nombreTienda,
      slogan: store.descripcionTienda || 'Tienda registrada en Circulo Animal.',
      region: store.regionTienda || store.region || 'Sin region',
      provincia: store.provinciaTienda || store.provincia || 'Sin provincia',
      comuna: store.comunaTienda || store.comuna || 'Sin comuna',
      address: store.direccionTienda,
      eta: 'A coordinar con la tienda',
      schedule: this.buildScheduleSummary(store.horarioTienda),
      deliveryFee: 'Consultar',
      rating: 5,
      coverage: (store.comunasRepartoTienda && store.comunasRepartoTienda.length > 0)
        ? store.comunasRepartoTienda
        : [store.comunaTienda || store.comuna || 'Cobertura a coordinar'],
      categories: store.categoriasTienda || [],
      highlight: store.descripcionTienda || 'Conoce esta tienda registrada en la comunidad.',
      description: store.descripcionTienda || 'Esta tienda forma parte de la red de Circulo Animal.',
      heroImage: storeImage,
      gallery: [storeImage],
      products: products.map((product) => this.toStoreProduct(product, store.categoriasTienda)),
      weeklySchedule: this.normalizeSchedule(store.horarioTienda),
    };
  }

  private toStoreProduct(product: BackendProducto, storeCategories: string[] = []): StoreProduct {
    return {
      id: Number(product._id.replace(/\D/g, '').slice(-8) || '0'),
      productoId: product._id,
      name: product.nombre,
      // Mientras el backend no exponga una categoria propia por producto,
      // usamos la primera categoria declarada por la tienda para evitar un valor hardcodeado.
      category: storeCategories[0] || 'Producto',
      price: new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        maximumFractionDigits: 0,
      }).format(product.precio),
      priceValue: product.precio,
      unidadVenta: product.unidadVenta || 'unidad',
      image: this.toDisplayImage(product.imagen) || this.fallbackImage,
      description: product.descripcion,
      disponible: this.isProductoDisponible(product),
      stock: product.stock,
      tags: [
        this.isProductoDisponible(product) ? 'Disponible' : 'No disponible',
      ],
    };
  }

  private isProductoDisponible(product: BackendProducto): boolean {
    if (typeof product.disponible === 'boolean') {
      return product.disponible;
    }

    if (typeof product.stock === 'number') {
      return product.stock > 0;
    }

    return true;
  }

  private buildScheduleSummary(schedule?: Array<{ dia: string; abierto: boolean; apertura?: string; cierre?: string }>): string {
    if (!schedule || schedule.length === 0) {
      return 'Horario informado por la tienda';
    }

    const openDays = schedule.filter((entry) => entry.abierto && entry.apertura && entry.cierre);

    if (openDays.length === 0) {
      return 'Actualmente cerrada';
    }

    const uniqueRanges = [...new Set(openDays.map((entry) => `${entry.apertura} - ${entry.cierre}`))];

    if (uniqueRanges.length === 1) {
      const firstDay = openDays[0].dia.slice(0, 3);
      const lastDay = openDays[openDays.length - 1].dia.slice(0, 3);
      const dayLabel = openDays.length === 1 ? firstDay : `${firstDay} a ${lastDay}`;

      return `${dayLabel} ${uniqueRanges[0]}`;
    }

    return openDays
      .map((entry) => `${entry.dia.slice(0, 3)} ${entry.apertura} - ${entry.cierre}`)
      .join(' · ');
  }

  private normalizeSchedule(
    schedule?: Array<{ dia: string; abierto: boolean; apertura?: string; cierre?: string }>
  ): StoreScheduleEntry[] {
    return (schedule ?? []).map((entry) => ({
      dia: entry.dia,
      abierto: entry.abierto,
      apertura: entry.apertura || '',
      cierre: entry.cierre || '',
    }));
  }

  private toDisplayImage(image?: string): string | undefined {
    if (!image?.trim()) {
      return image;
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
}
