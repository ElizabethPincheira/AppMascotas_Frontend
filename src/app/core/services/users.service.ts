import { Injectable } from '@angular/core';
import axios from 'axios';
import { environment } from '../../../environments/environment';


@Injectable({//
  providedIn: 'root'
})
export class UsersService {

  private apiUrl = `${environment.apiUrl}`;



  async register(email: string, password: string, nombre: string, region: string | null, provincia: string | null, comuna: string | null): Promise<any> {

    const registerData = { email, password, nombre, region, provincia, comuna};
    const response = await axios.post(this.apiUrl + "user", registerData);

    console.log(response.data, 'respuesta del backend');
    return response.data;
  }


  async login(email: string, password: string): Promise<any> {
    const loginData = { email, password };
    const response = await axios.post(this.apiUrl + "user/" + "login", loginData);

    console.log(response.data, 'respuesta del backend');
    return response.data;
  }

  async updateProfile(profileData: {
    nombre: string;
    email: string;
    telefono?: string;
    region?: string;
    provincia?: string;
    comuna?: string;
  }): Promise<any> {
    const token = localStorage.getItem('token');

    const response = await axios.patch(this.apiUrl + 'user/profile', profileData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  }

  async registerStore(storeData: {
    nombreTienda: string;
    descripcionTienda: string;
    direccionTienda: string;
    telefonoTienda: string;
    regionTienda: string;
    provinciaTienda: string;
    comunaTienda: string;
    categoriasTienda: string[];
    comunasRepartoTienda: string[];
  }): Promise<any> {
    const token = localStorage.getItem('token');

    const response = await axios.patch(this.apiUrl + 'user/store-registration', storeData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  }

  async updateStoreProfile(storeData: {
    nombreTienda: string;
    descripcionTienda: string;
    direccionTienda: string;
    telefonoTienda: string;
    regionTienda: string;
    provinciaTienda: string;
    comunaTienda: string;
    categoriasTienda: string[];
    comunasRepartoTienda: string[];
    horarioTienda: Array<{
      dia: string;
      abierto: boolean;
      apertura?: string;
      cierre?: string;
    }>;
  }): Promise<any> {
    const token = localStorage.getItem('token');

    const response = await axios.patch(this.apiUrl + 'user/store-profile', storeData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  }

  async getAdminUsers(): Promise<any> {
    const token = localStorage.getItem('token');

    const response = await axios.get(this.apiUrl + 'user/admin/users', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  }

  async updateAdminUserStatus(userId: string, isActive: boolean): Promise<any> {
    const token = localStorage.getItem('token');

    const response = await axios.patch(this.apiUrl + `user/admin/users/${userId}/status`, {
      isActive,
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  }

  async deleteAdminUser(userId: string): Promise<any> {
    const token = localStorage.getItem('token');

    const response = await axios.delete(this.apiUrl + `user/admin/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  }

}
