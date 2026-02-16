import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class MascotaService {

  private apiUrl = 'https://dog.ceo/api/breeds/image/random';

  constructor(private http: HttpClient) { }

  getImagen(): Observable<string> {
  return this.http.get<any>(this.apiUrl)
    .pipe(
      map(response => response.message)
    );
}

}


