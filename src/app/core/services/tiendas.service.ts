import { Injectable } from '@angular/core';
import axios from 'axios';
import { environment } from '../../../environments/environment';

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

@Injectable({
  providedIn: 'root'
})
export class TiendasService {
  private apiUrl = `${environment.apiUrl}`;

  async getApprovedStores(): Promise<Store[]> {
    try {
      const response = await axios.get(this.apiUrl + 'user/stores/approved');
      return response.data.stores || [];
    } catch (error) {
      console.error('Error al obtener tiendas:', error);
      return [];
    }
  }
}
