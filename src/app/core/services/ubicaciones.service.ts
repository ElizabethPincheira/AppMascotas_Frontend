import { Injectable } from '@angular/core';
import axios from 'axios';
import { environment } from '../../../environments/environment';


@Injectable({//
    providedIn: 'root'
})
export class UbicacionesService {

    private apiUrl = `${environment.apiUrl}ubicaciones/`;

    async getUbicaciones(region?: string, provincia?: string): Promise<string[]> {
        const normalizedRegion = region?.trim();
        const normalizedProvincia = provincia?.trim();

        const params: Record<string, string> = {};

        if (normalizedRegion) {
            params['region'] = normalizedRegion;
        }

        if (normalizedProvincia) {
            params['provincia'] = normalizedProvincia;
        }

        const response = await axios.get(this.apiUrl, { params });
        return response.data;
    }
}
