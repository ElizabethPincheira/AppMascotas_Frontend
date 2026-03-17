import { Injectable } from '@angular/core';
import axios, { Axios } from 'axios';
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

}


