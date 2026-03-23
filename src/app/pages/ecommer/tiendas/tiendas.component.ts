import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DeliveryStore } from '../tiendas/delivery-store.model';
import { StoreCardComponent } from './store-card/store-card.component';

@Component({
  selector: 'app-tiendas',
  standalone: true,
  imports: [CommonModule, FormsModule, StoreCardComponent],
  templateUrl: './tiendas.component.html',
  styleUrls: ['./tiendas.component.css']
})
export class TiendaComponent {
  selectedRegion = '';
  selectedProvincia = '';
  selectedComuna = '';

  readonly stores: DeliveryStore[] = [
    {
      id: 1,
      name: 'Patitas Express',
      region: 'Region Metropolitana',
      provincia: 'Santiago',
      comuna: 'Las Condes',
      address: 'Av. Apoquindo 4120',
      eta: '45 a 70 min',
      schedule: 'Lun a Sab 09:00 - 20:30',
      coverage: ['Las Condes', 'Vitacura', 'Providencia'],
      categories: ['Alimento premium', 'Gatos', 'Despacho rapido'],
      highlight: 'Especialistas en alimento premium y entregas durante el mismo dia.'
    },
    {
      id: 2,
      name: 'Ruta Animal Sur',
      region: 'Region Metropolitana',
      provincia: 'Santiago',
      comuna: 'La Florida',
      address: 'Walker Martinez 1784',
      eta: '60 a 90 min',
      schedule: 'Lun a Dom 10:00 - 21:00',
      coverage: ['La Florida', 'Macul', 'Penalolen'],
      categories: ['Perros', 'Sacos grandes', 'Reparto local'],
      highlight: 'Muy buscada por hogares con varios perros y compras de volumen.'
    },
    {
      id: 3,
      name: 'Puerto Mascota',
      region: 'Region de Valparaiso',
      provincia: 'Valparaiso',
      comuna: 'Vina del Mar',
      address: '1 Norte 940',
      eta: '50 a 80 min',
      schedule: 'Lun a Sab 09:30 - 20:00',
      coverage: ['Vina del Mar', 'Valparaiso', 'Quilpue'],
      categories: ['Gatos', 'Snacks', 'Entrega programada'],
      highlight: 'Ideal para compras mensuales y pedidos programados en la zona costera.'
    },
    {
      id: 4,
      name: 'Compania Perruna',
      region: 'Region de Valparaiso',
      provincia: 'Marga Marga',
      comuna: 'Quilpue',
      address: 'Freire 622',
      eta: '35 a 60 min',
      schedule: 'Lun a Vie 10:00 - 19:30',
      coverage: ['Quilpue', 'Villa Alemana', 'Olmue'],
      categories: ['Economico', 'Alimento cachorro', 'Reparto barrial'],
      highlight: 'Opcion cercana y economica con foco en barrios residenciales.'
    },
    {
      id: 5,
      name: 'Norte Mascotero',
      region: 'Region de Antofagasta',
      provincia: 'Antofagasta',
      comuna: 'Antofagasta',
      address: 'Av. Argentina 1260',
      eta: '60 a 100 min',
      schedule: 'Lun a Sab 09:00 - 20:00',
      coverage: ['Antofagasta', 'Mejillones'],
      categories: ['Perros grandes', 'Alimento veterinario', 'Despacho zonal'],
      highlight: 'Trabaja con lineas veterinarias y productos de soporte nutricional.'
    },
    {
      id: 6,
      name: 'Huellitas Serena',
      region: 'Region de Coquimbo',
      provincia: 'Elqui',
      comuna: 'La Serena',
      address: 'Balmaceda 2150',
      eta: '40 a 75 min',
      schedule: 'Lun a Dom 09:30 - 21:00',
      coverage: ['La Serena', 'Coquimbo'],
      categories: ['Gatos', 'Perros', 'Despacho en el dia'],
      highlight: 'Muy valorada por rapidez y cobertura entre La Serena y Coquimbo.'
    }
  ];

  get regions(): string[] {
    return [...new Set(this.stores.map((store) => store.region))].sort();
  }

  get provincias(): string[] {
    return [...new Set(
      this.stores
        .filter((store) => !this.selectedRegion || store.region === this.selectedRegion)
        .map((store) => store.provincia)
    )].sort();
  }

  get comunas(): string[] {
    return [...new Set(
      this.stores
        .filter((store) => (!this.selectedRegion || store.region === this.selectedRegion))
        .filter((store) => (!this.selectedProvincia || store.provincia === this.selectedProvincia))
        .map((store) => store.comuna)
    )].sort();
  }

  get filteredStores(): DeliveryStore[] {
    return this.stores.filter((store) => {
      const matchesRegion = !this.selectedRegion || store.region === this.selectedRegion;
      const matchesProvincia = !this.selectedProvincia || store.provincia === this.selectedProvincia;
      const matchesComuna = !this.selectedComuna || store.comuna === this.selectedComuna;

      return matchesRegion && matchesProvincia && matchesComuna;
    });
  }

  onRegionChange(): void {
    this.selectedProvincia = '';
    this.selectedComuna = '';
  }

  onProvinciaChange(): void {
    this.selectedComuna = '';
  }
}
