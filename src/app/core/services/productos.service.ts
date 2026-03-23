import { Injectable } from '@angular/core';
import axios from 'axios';
import { environment } from '../../../environments/environment';

export interface Producto {
  _id: string;
  tiendaId: string;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  imagen?: string;
  activo: boolean;
  fechaCreacion: Date;
  fechaActualizacion: Date;
}

export interface CreateProductoDto {
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  imagen?: string;
}

export interface UpdateProductoDto {
  nombre?: string;
  descripcion?: string;
  precio?: number;
  stock?: number;
  imagen?: string;
  activo?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ProductosService {
  private apiUrl = `${environment.apiUrl}`;

  async createProducto(productoData: CreateProductoDto): Promise<any> {
    const token = localStorage.getItem('token');

    const response = await axios.post(this.apiUrl + 'productos', productoData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  }

  async getProductosByTienda(): Promise<Producto[]> {
    const token = localStorage.getItem('token');

    try {
      const response = await axios.get(this.apiUrl + 'productos', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data.productos || [];
    } catch (error) {
      console.error('Error al obtener productos:', error);
      return [];
    }
  }

  async updateProducto(productoId: string, updateData: UpdateProductoDto): Promise<any> {
    const token = localStorage.getItem('token');

    const response = await axios.patch(this.apiUrl + `productos/${productoId}`, updateData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  }

  async deleteProducto(productoId: string): Promise<any> {
    const token = localStorage.getItem('token');

    const response = await axios.delete(this.apiUrl + `productos/${productoId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  }

  async compressImage(file: File, maxWidth = 800, maxHeight = 800, quality = 0.8): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event: any) => {
        const img = new Image();

        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height *= maxWidth / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width *= maxHeight / height;
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
          }

          const base64 = canvas.toDataURL('image/jpeg', quality);
          resolve(base64);
        };

        img.onerror = () => reject(new Error('Error al cargar la imagen'));
        img.src = event.target.result;
      };

      reader.onerror = () => reject(new Error('Error al leer el archivo'));
      reader.readAsDataURL(file);
    });
  }
}
