import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { map } from 'rxjs/operators';
import { DELIVERY_STORES, getStoreById } from '../tiendas/delivery-store.data';
import { StoreProduct } from '../tiendas/delivery-store.model';

@Component({
  selector: 'app-store-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './tienda.component.html',
  styleUrls: ['./tienda.component.css']
})
export class StoreDetailComponent {
  private readonly route = inject(ActivatedRoute);

  readonly featuredStores = DELIVERY_STORES.slice(0, 3);

  readonly store$ = this.route.paramMap.pipe(
    map((params) => Number(params.get('id'))),
    map((storeId) => getStoreById(storeId))
  );

  trackByProductId(_: number, product: StoreProduct): number {
    return product.id;
  }
}
