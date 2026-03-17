import { Injectable } from '@angular/core';
import axios, { Axios } from 'axios';
import { environment } from '../../../environments/environment';


@Injectable({//
  providedIn: 'root'
})
export class UsersService {

  private apiUrl = `${environment.apiUrl}`;



  async register(email: string, password: string, nombre: string, comuna: string, ciudad: string): Promise<any> {

    const registerData = { email, password, nombre, comuna, ciudad };
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

}