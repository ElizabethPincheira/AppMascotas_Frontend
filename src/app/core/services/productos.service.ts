import { Injectable } from '@angular/core';
import axios from 'axios';
import { environment } from '../../../environments/environment';

export interface Producto {
  _id: string;
  tiendaId: string;
  nombre: string;
  descripcion: string;
  precio: number;
  stock?: number;
  disponible?: boolean;
  imagen?: string;
  activo: boolean;
  fechaCreacion: Date;
  fechaActualizacion: Date;
}

export interface CreateProductoDto {
  nombre: string;
  descripcion: string;
  precio: number;
  stock?: number;
  disponible?: boolean;
  imagen?: string;
}

export interface UpdateProductoDto {
  nombre?: string;
  descripcion?: string;
  precio?: number;
  stock?: number;
  disponible?: boolean;
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
    const payload: CreateProductoDto = {
      ...productoData,
      imagen: this.toBase64Payload(productoData.imagen),
    };

    const response = await axios.post(this.apiUrl + 'productos', payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return {
      ...response.data,
      producto: response.data?.producto
        ? this.normalizeProductoImage(response.data.producto)
        : response.data?.producto,
    };
  }

  async getProductosByTienda(): Promise<Producto[]> {
    const token = localStorage.getItem('token');

    try {
      const response = await axios.get(this.apiUrl + 'productos', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return (response.data.productos || []).map((producto: Producto) =>
        this.normalizeProductoImage(producto),
      );
    } catch (error) {
      console.error('Error al obtener productos:', error);
      return [];
    }
  }

  async updateProducto(productoId: string, updateData: UpdateProductoDto): Promise<any> {
    const token = localStorage.getItem('token');
    const payload: UpdateProductoDto = {
      ...updateData,
      ...(Object.prototype.hasOwnProperty.call(updateData, 'imagen')
        ? { imagen: this.toBase64Payload(updateData.imagen) }
        : {}),
    };

    const response = await axios.patch(this.apiUrl + `productos/${productoId}`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return {
      ...response.data,
      producto: response.data?.producto
        ? this.normalizeProductoImage(response.data.producto)
        : response.data?.producto,
    };
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

  private normalizeProductoImage(producto: Producto): Producto {
    return {
      ...producto,
      imagen: this.toDisplayImage(producto.imagen),
    };
  }

  private toBase64Payload(image?: string): string | undefined {
    if (!image?.trim()) {
      return image;
    }

    return image.replace(/^data:image\/[a-zA-Z0-9.+-]+;base64,/, '').trim();
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
