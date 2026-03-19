import { Injectable } from '@angular/core';
import axios from 'axios';
import { environment } from '../../../environments/environment';

@Injectable({//
  providedIn: 'root'
})
export class MascotaService {

  private apiUrl = `${environment.apiUrl}mascotas/`;

  async getMascotas(): Promise<any[]> {
    let url = this.apiUrl;
    const response = await axios.get(url);
    return response.data;
  }

  async createMascota(payload: Record<string, unknown>): Promise<any> {
    const token = localStorage.getItem('token');
    const response = await axios.post(this.apiUrl, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });

    return response.data;
  }

  async cargarImagenes(id: string, imagenes: string[]): Promise<any> {
    const token = localStorage.getItem('token');
    const response = await axios.patch(`${this.apiUrl}${id}/imagenes`, { imagenes }, {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });

    return response.data;
  }

}

