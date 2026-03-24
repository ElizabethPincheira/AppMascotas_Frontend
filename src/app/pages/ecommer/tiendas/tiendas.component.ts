import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TiendasService } from '../../../core/services/tiendas.service';
import { DeliveryStore } from './delivery-store.model';
import { StoreCardComponent } from './store-card/store-card.component';

@Component({
  selector: 'app-tiendas',
  standalone: true,
  imports: [CommonModule, FormsModule, StoreCardComponent],
  templateUrl: './tiendas.component.html',
  styleUrls: ['./tiendas.component.css']
})
export class TiendaComponent implements OnInit {
  private readonly tiendasService = inject(TiendasService);

  selectedRegion = '';
  selectedProvincia = '';
  selectedComuna = '';
  stores: DeliveryStore[] = [];
  cargandoTiendas = false;

  async ngOnInit(): Promise<void> {
    await this.cargarTiendasDelBackend();
  }

  async cargarTiendasDelBackend(): Promise<void> {
    this.cargandoTiendas = true;

    try {
      const storesDelBackend = await this.tiendasService.getApprovedStores();
      this.stores = storesDelBackend.map((store) => this.tiendasService.toDeliveryStore(store));
    } catch (error) {
      console.error('Error al cargar tiendas del backend:', error);
      this.stores = [];
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
        .filter((store) => !this.selectedRegion || store.region === this.selectedRegion)
        .filter((store) => !this.selectedProvincia || store.provincia === this.selectedProvincia)
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
