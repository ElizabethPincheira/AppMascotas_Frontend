import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DELIVERY_STORES } from './delivery-store.data';
import { DeliveryStore } from './delivery-store.model';
import { StoreCardComponent } from './store-card/store-card.component';
import { TiendasService, Store } from '../../../core/services/tiendas.service';

@Component({
  selector: 'app-tiendas',
  standalone: true,
  imports: [CommonModule, FormsModule, StoreCardComponent],
  templateUrl: './tiendas.component.html',
  styleUrls: ['./tiendas.component.css']
})
export class TiendaComponent implements OnInit {
  private tiendasService = inject(TiendasService);

  selectedRegion = '';
  selectedProvincia = '';
  selectedComuna = '';
  stores: DeliveryStore[] = DELIVERY_STORES;
  cargandoTiendas = false;

  async ngOnInit(): Promise<void> {
    await this.cargarTiendasDelBackend();
  }

  private async cargarTiendasDelBackend(): Promise<void> {
    this.cargandoTiendas = true;

    try {
      const storesDelBackend = await this.tiendasService.getApprovedStores();

      // Convertir tiendas del backend al formato DeliveryStore
      const tienddasFormateadas: DeliveryStore[] = storesDelBackend.map((store: Store, index: number) => ({
        id: index + 1000,
        slug: store.nombreTienda.toLowerCase().replace(/\s+/g, '-'),
        name: store.nombreTienda,
        slogan: store.descripcionTienda,
        region: store.region,
        provincia: store.provincia,
        comuna: store.comuna,
        address: store.direccionTienda,
        eta: 'Variable',
        schedule: 'Consultar',
        deliveryFee: 'Consultar',
        rating: 5,
        coverage: [store.comuna],
        categories: store.categoriasTienda,
        highlight: store.descripcionTienda,
        description: store.descripcionTienda,
        heroImage: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=1200&q=80',
        gallery: [],
        products: [],
      }));

      // Combinar tiendas hardcodeadas con las del backend
      this.stores = [...DELIVERY_STORES, ...tienddasFormateadas];
    } catch (error) {
      console.error('Error al cargar tiendas del backend:', error);
      // Mantener solo las tiendas hardcodeadas si hay error
    } finally {
      this.cargandoTiendas = false;
    }
  }

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
