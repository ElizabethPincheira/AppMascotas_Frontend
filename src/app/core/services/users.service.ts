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

  async requestPasswordRecovery(email: string): Promise<any> {
    const response = await axios.post(this.apiUrl + 'auth/recuperar-password', {
      email,
    });

    return response.data;
  }

  async resetPassword(token: string, password: string): Promise<any> {
    const response = await axios.post(this.apiUrl + 'auth/nueva-password', {
      token,
      password,
    });

    return response.data;
  }

  async verifyEmail(token: string): Promise<any> {
    const response = await axios.get(this.apiUrl + 'auth/verificar-email', {
      params: { token },
    });

    return response.data;
  }

  async verifyEmailCode(email: string, code: string): Promise<any> {
    const response = await axios.post(this.apiUrl + 'auth/verificar-email', {
      email,
      code,
    });

    return response.data;
  }

  async resendVerificationEmail(email: string): Promise<any> {
    const response = await axios.post(this.apiUrl + 'auth/reenviar-verificacion', {
      email,
    });

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
    aceptaContratoTienda: boolean;
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
    imagenTienda?: string;
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

  async getAdminStores(): Promise<any> {
    const token = localStorage.getItem('token');

    const response = await axios.get(this.apiUrl + 'user/admin/stores', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  }

  async getAdminStats(): Promise<any> {
    const token = localStorage.getItem('token');

    const response = await axios.get(this.apiUrl + 'admin/stats', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  }

  async getAdminStoreById(storeId: string): Promise<any> {
    const token = localStorage.getItem('token');

    const response = await axios.get(this.apiUrl + `user/admin/stores/${storeId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  }

  async updateAdminStoreStatus(storeId: string, status: 'aprobada' | 'rechazada', motivoRechazo?: string): Promise<any> {
    const token = localStorage.getItem('token');

    const response = await axios.patch(this.apiUrl + `user/admin/stores/${storeId}/status`, {
      status,
      motivoRechazo,
    }, {
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
