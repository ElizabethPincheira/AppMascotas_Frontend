import { Injectable } from '@angular/core';
import axios, { Axios } from 'axios'; 

@Injectable({//
  providedIn: 'root' 
})
export class MascotaService { 

  private apiUrl = 'http://localhost:8080/mascotas/';

  async getMascotas(): Promise<any[]> {
    let url = this.apiUrl + 'todas';
    const response = await axios.get(url);
    return response.data;
  }

}


