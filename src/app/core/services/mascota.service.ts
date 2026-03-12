import { Injectable } from '@angular/core'; // Esto permite que el servicio pueda ser inyectado en otras partes (como en componentes).
import axios, { Axios } from 'axios'; // Es una biblioteca de JavaScript que se utiliza para hacer solicitudes HTTP desde el navegador o desde Node.js. Proporciona una interfaz fácil de usar para realizar peticiones HTTP, manejar respuestas y errores, y trabajar con datos en formato JSON.

@Injectable({//
  providedIn: 'root' // El servicio estará disponible en toda la app, no es necesario importarlo en cada módulo.
})
export class MascotaService { // Es el servicio que se encargará de manejar la lógica relacionada con las mascotas, como obtener datos, agregar nuevas mascotas, etc.

  private apiUrl = 'https://dog.ceo/api/breeds/image/random';// URL de la API que devuelve una imagen aleatoria de un perro.

  async getImagen(): Promise<string> {// Método que devuelve una promesa que emitirá la URL de la imagen del perro.
    const response = await axios.get(this.apiUrl)// Hacemos una petición GET a la API para obtener la imagen del perro.
    return response.data.message// La respuesta de la API tiene una estructura que incluye un campo 'message' que contiene la URL de la imagen del perro. Por eso accedemos a response.data.message para obtener esa URL.

  }



}

/*



import { HttpClient } from '@angular/common/http'; // Es la herramienta oficial de Angular para hacer peticiones HTTP. (GET,POST, PUT, DELETE)
import { Injectable } from '@angular/core'; //Esto permite que el servicio pueda ser inyectado en otras partes (como en componentes).
import { map, Observable } from 'rxjs';


@Injectable({
  providedIn: 'root' //El servicio estará disponible en toda la app, no es necesario importarlo en cada módulo.
})
export class MascotaService { // Es el servicio que se encargará de manejar la lógica relacionada con las mascotas, como obtener datos, agregar nuevas mascotas, etc.

  private apiUrl = 'https://dog.ceo/api/breeds/image/random';// URL de la API que devuelve una imagen aleatoria de un perro.

  constructor(private http: HttpClient) { }// Inyectamos HttpClient para poder hacer peticiones HTTP a la API.

  getImagen(): Observable<string> { // Método que devuelve un Observable que emitirá la URL de la imagen del perro.
  return this.http.get<any>(this.apiUrl) // Hacemos una petición GET a la API para obtener la imagen del perro. El tipo de respuesta se define como 'any' porque no conocemos la estructura exacta de la respuesta.
    .pipe( //
      map(response => response.message)//
    );
}

}




*/

