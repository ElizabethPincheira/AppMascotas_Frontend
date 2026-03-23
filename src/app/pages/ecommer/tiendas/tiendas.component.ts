import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DELIVERY_STORES } from './delivery-store.data';
import { DeliveryStore } from './delivery-store.model';
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

  readonly stores: DeliveryStore[] = DELIVERY_STORES;

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
