import { Injectable } from '@angular/core';
import axios, { Axios } from 'axios';
import { environment } from '../../../environments/environment';


@Injectable({//
    providedIn: 'root'
})
export class UbicacionesService {

    private apiUrl = `${environment.apiUrl}ubicaciones/`;

    async getUbicaciones(region?: string, provincia?: string, comuna?: string) {

        let url = this.apiUrl;

        const params = new URLSearchParams();

        if (region) params.append('region', region);
        if (provincia) params.append('provincia', provincia);
        if (comuna) params.append('comuna', comuna);

        url += '?' + params.toString();

        const response = await axios.get(url);
        return response.data;
    }


}