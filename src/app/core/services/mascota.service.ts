import { Injectable } from '@angular/core';
import axios from 'axios';
import { environment } from '../../../environments/environment';

@Injectable({//
  providedIn: 'root'
})
export class MascotaService {

  private apiUrl = `${environment.apiUrl}mascotas/`;

  async getMascotas(params?: Record<string, unknown>): Promise<any[]> {
    const response = await axios.get(this.apiUrl, { params });
    return response.data;
  }

  async getMascotasByOwner(ownerId: string): Promise<any[]> {
    const response = await axios.get(this.apiUrl, {
      params: {
        usuarioId: ownerId,
      }
    });

    return response.data;
  }

  async getMascotaById(id: string): Promise<any | null> {
    const mascotas = await this.getMascotas();
    return mascotas.find((mascota) => (mascota._id ?? mascota.id) === id) ?? null;
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

  async createMascotaPublica(payload: Record<string, unknown>): Promise<any> {
    const response = await axios.post(`${this.apiUrl}public`, payload);
    return response.data;
  }

  async updateMascota(id: string, payload: Record<string, unknown>): Promise<any> {
    const token = localStorage.getItem('token');
    const response = await axios.patch(`${this.apiUrl}${id}`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });

    return response.data;
  }

  async deleteMascota(id: string): Promise<any> {
    const token = localStorage.getItem('token');
    const response = await axios.delete(`${this.apiUrl}${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });

    return response.data;
  }

  async cargarImagenesPublicas(id: string, imagenes: string[]): Promise<any> {
    const response = await axios.patch(`${this.apiUrl}${id}/public-imagenes`, { imagenes });
    return response.data;
  }

}
