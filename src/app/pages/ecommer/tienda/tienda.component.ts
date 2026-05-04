import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../../../core/services/auth.service';
import { CarritoService } from '../../../core/services/carrito.service';
import { SeoService } from '../../../core/services/seo.service';
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
  private readonly carritoService = inject(CarritoService);
  private readonly authService = inject(AuthService);
  private readonly seoService = inject(SeoService);

  featuredStores: DeliveryStore[] = [];
  store: DeliveryStore | null = null;
  cargando = false;

  async ngOnInit(): Promise<void> {
    this.seoService.setPage(
      'Tienda solidaria — Círculo Animal',
      'Explora el detalle de esta tienda solidaria y descubre productos para apoyar a la comunidad animal.',
    );

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
      let [storeData, relatedStores, products] = await Promise.all([
        this.tiendasService.getApprovedStoreById(storeId),
        this.tiendasService.getApprovedStores(),
        this.tiendasService.getPublicProductsByStore(storeId),
      ]);

      if (!storeData && this.esAdmin()) {
        storeData = await this.tiendasService.getAdminStoreById(storeId);
      }

      this.featuredStores = relatedStores
        .filter((relatedStore) => relatedStore._id !== storeId)
        .slice(0, 3)
        .map((relatedStore) => this.tiendasService.toDeliveryStore(relatedStore));

      this.store = storeData
        ? this.tiendasService.toDeliveryStore(storeData, products)
        : null;

      if (this.store) {
        this.seoService.setPage(
          `${this.store.name} — Círculo Animal`,
          this.store.description || `Conoce ${this.store.name}, tienda solidaria disponible en Círculo Animal.`,
          this.store.heroImage,
        );
      }
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

  formatProductPrice(product: StoreProduct): string {
    return product.unidadVenta === 'kilo' ? `${product.price} / kg` : product.price;
  }

  private esAdmin(): boolean {
    const user = this.authService.getUser();
    const roles = Array.isArray(user?.roles) ? user.roles : [];

    return roles.some((role: string) => ['admin', 'administrador'].includes(String(role).toLowerCase()));
  }

  async agregarAlCarrito(product: StoreProduct): Promise<void> {
    if (!this.store || !product.disponible) {
      return;
    }

    // Si el producto tiene mínimo de kilos, dirigir al detalle del producto
    if (product.unidadVenta === 'kilo' && product.minimoKilos) {
      await Swal.fire({
        icon: 'info',
        title: 'Cantidad mínima requerida',
        text: `Este producto tiene un mínimo de ${product.minimoKilos} kg por compra. Por favor, especifica la cantidad en el detalle del producto.`,
        confirmButtonText: 'Ir al producto',
      });
      // Navegar a la página de detalle del producto
      window.location.href = `/tiendas/${this.store.id}/productos/${product.productoId}`;
      return;
    }

    const agregado = this.carritoService.agregarItem(
      {
        productoId: product.productoId,
        tiendaId: String(this.store.id),
        nombre: product.name,
        precio: product.priceValue,
        imagen: product.image,
        cantidad: 1,
        unidadVenta: product.unidadVenta,
      },
      this.store.name,
    );

    if (!agregado) {
      return;
    }

    await Swal.fire({
      icon: 'success',
      title: 'Producto agregado',
      text: `${product.name} fue agregado al carrito.`,
      timer: 1500,
      showConfirmButton: false,
    });
  }
}
