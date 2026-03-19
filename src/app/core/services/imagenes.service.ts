import { Injectable } from '@angular/core';
import axios from 'axios';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ImagenesService {
  private readonly apiUrl = `${environment.apiUrl}mascotas/`;

  async filesToBase64(files: File[]): Promise<string[]> {
    const results = await Promise.all(files.map((file) => this.readFileAsDataUrl(file)));
    return results.map((result) => result.split(',')[1] ?? result);
  }

  async cargarImagenesMascota(id: string, imagenesBase64: string[]): Promise<any> {
    const token = localStorage.getItem('token');
    const response = await axios.patch(`${this.apiUrl}${id}/imagenes`, { imagenes: imagenesBase64 }, {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });

    return response.data;
  }

  private readFileAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}
