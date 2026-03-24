import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TiendasService } from '../../../core/services/tiendas.service';
import { DeliveryStore, StoreProduct } from '../tiendas/delivery-store.model';

@Component({
  selector: 'app-store-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './tienda.component.html',
  styleUrls: ['./tienda.component.css']
})
export class StoreDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly tiendasService = inject(TiendasService);

  featuredStores: DeliveryStore[] = [];
  store: DeliveryStore | null = null;
  cargando = false;

  async ngOnInit(): Promise<void> {
    await this.cargarTienda();
  }

  async cargarTienda(): Promise<void> {
    const storeId = this.route.snapshot.paramMap.get('id');

    if (!storeId) {
      this.store = null;
      return;
    }

    this.cargando = true;

    try {
      const [storeData, relatedStores, products] = await Promise.all([
        this.tiendasService.getApprovedStoreById(storeId),
        this.tiendasService.getApprovedStores(),
        this.tiendasService.getPublicProductsByStore(storeId),
      ]);

      this.featuredStores = relatedStores
        .filter((relatedStore) => relatedStore._id !== storeId)
        .slice(0, 3)
        .map((relatedStore) => this.tiendasService.toDeliveryStore(relatedStore));

      this.store = storeData
        ? this.tiendasService.toDeliveryStore(storeData, products)
        : null;
    } catch (error) {
      console.error('Error al cargar detalle de tienda:', error);
      this.store = null;
    } finally {
      this.cargando = false;
    }
  }

  trackByProductId(_: number, product: StoreProduct): number {
    return product.id;
  }
}
