import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { CarritoService } from '../../../core/services/carrito.service';
import { SeoService } from '../../../core/services/seo.service';
import { TiendasService } from '../../../core/services/tiendas.service';
import { DeliveryStore, StoreProduct, StoreScheduleEntry } from '../tiendas/delivery-store.model';

@Component({
  selector: 'app-producto-detalle',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './producto-detalle.component.html',
  styleUrls: ['./producto-detalle.component.css'],
})
export class ProductoDetalleComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly tiendasService = inject(TiendasService);
  private readonly carritoService = inject(CarritoService);
  private readonly seoService = inject(SeoService);

  store: DeliveryStore | null = null;
  product: StoreProduct | null = null;
  cargando = true;
  cantidad = 1;
  private readonly dayOrder = [
    'Lunes',
    'Martes',
    'Miercoles',
    'Jueves',
    'Viernes',
    'Sabado',
    'Domingo',
  ];

  async ngOnInit(): Promise<void> {
    this.seoService.setPage(
      'Detalle de producto — Círculo Animal',
      'Revisa información del producto, disponibilidad y tienda antes de agregarlo al carrito.',
    );

    await this.cargarProducto();
  }

  async cargarProducto(): Promise<void> {
    const storeId = this.route.snapshot.paramMap.get('id');
    const productId = this.route.snapshot.paramMap.get('productoId');

    if (!storeId || !productId) {
      this.store = null;
      this.product = null;
      this.cargando = false;
      return;
    }

    this.cargando = true;

    try {
      const [storeData, products] = await Promise.all([
        this.tiendasService.getApprovedStoreById(storeId),
        this.tiendasService.getPublicProductsByStore(storeId),
      ]);

      this.store = storeData ? this.tiendasService.toDeliveryStore(storeData, products) : null;
      this.product = this.store?.products.find((item) => item.productoId === productId) ?? null;

      // Establecer cantidad inicial según el mínimo de kilos
      if (this.product?.unidadVenta === 'kilo' && this.product?.minimoKilos) {
        this.cantidad = this.product.minimoKilos;
      } else {
        this.cantidad = 1;
      }

      if (this.store && this.product) {
        this.seoService.setPage(
          `${this.product.name} — ${this.store.name}`,
          this.product.description || `Compra ${this.product.name} en ${this.store.name}.`,
          this.product.image,
        );
      }
    } catch (error) {
      console.error('Error al cargar detalle de producto:', error);
      this.store = null;
      this.product = null;
    } finally {
      this.cargando = false;
    }
  }

  get relatedProducts(): StoreProduct[] {
    if (!this.store || !this.product) {
      return [];
    }

    return this.store.products
      .filter((item) => item.productoId !== this.product?.productoId)
      .slice(0, 3);
  }

  get stockLabel(): string {
    if (!this.product?.disponible) {
      return 'No disponible por ahora';
    }

    if (typeof this.product.stock === 'number') {
      const unit = this.product.unidadVenta === 'kilo' ? 'kg' : 'unidad(es)';
      return this.product.stock > 0
        ? `${this.product.stock} ${unit} disponibles`
        : 'Stock a confirmar con la tienda';
    }

    return 'Disponible para compra';
  }

  get priceLabel(): string {
    if (!this.product) {
      return '';
    }

    return this.product.unidadVenta === 'kilo' ? `${this.product.price} / kg` : this.product.price;
  }

  get quantityUnitLabel(): string {
    return this.product?.unidadVenta === 'kilo' ? 'kg' : 'u.';
  }

  get minimumQuantityLabel(): string {
    if (!this.product || this.product.unidadVenta !== 'kilo' || !this.product.minimoKilos) {
      return '';
    }
    return `Mínimo ${this.product.minimoKilos} kg`;
  }

  get quantityErrorMessage(): string {
    if (!this.product || this.product.unidadVenta !== 'kilo' || !this.product.minimoKilos) {
      return '';
    }
    return `La cantidad mínima permitida es ${this.product.minimoKilos} kg`;
  }

  get isValidQuantity(): boolean {
    if (!this.product) {
      return false;
    }
    
    if (this.product.unidadVenta === 'kilo' && this.product.minimoKilos) {
      return this.cantidad >= this.product.minimoKilos;
    }
    
    return this.cantidad > 0;
  }

  get subtotal(): number {
    return (this.product?.priceValue ?? 0) * this.cantidad;
  }

  get hasWeeklySchedule(): boolean {
    return (this.store?.weeklySchedule.length ?? 0) > 0;
  }

  get todaySchedule(): StoreScheduleEntry | null {
    if (!this.store) {
      return null;
    }

    const today = this.dayOrder[(new Date().getDay() + 6) % 7];
    return this.store.weeklySchedule.find((item) => item.dia === today) ?? null;
  }

  get scheduleStatusLabel(): string {
    if (!this.hasWeeklySchedule || !this.todaySchedule) {
      return 'A coordinar';
    }

    return this.todaySchedule.abierto ? 'Abierto hoy' : 'Cerrado hoy';
  }

  get todayScheduleLabel(): string {
    if (!this.hasWeeklySchedule) {
      return this.store?.schedule || 'Horario informado por la tienda';
    }

    if (!this.todaySchedule) {
      return 'Horario no informado para hoy';
    }

    if (!this.todaySchedule.abierto) {
      return 'La tienda no atiende hoy';
    }

    return `${this.todaySchedule.apertura} - ${this.todaySchedule.cierre}`;
  }

  get orderedWeeklySchedule(): StoreScheduleEntry[] {
    return [...(this.store?.weeklySchedule ?? [])].sort(
      (a, b) => this.dayOrder.indexOf(a.dia) - this.dayOrder.indexOf(b.dia),
    );
  }

  isTodaySchedule(item: StoreScheduleEntry): boolean {
    const today = this.dayOrder[(new Date().getDay() + 6) % 7];
    return item.dia === today;
  }

  aumentarCantidad(): void {
    this.cantidad = Math.min(this.cantidad + 1, 99);
  }

  disminuirCantidad(): void {
    const minCantidad = (this.product?.unidadVenta === 'kilo' && this.product?.minimoKilos)
      ? this.product.minimoKilos
      : 1;
    this.cantidad = Math.max(this.cantidad - 1, minCantidad);
  }

  trackByProductId(_: number, product: StoreProduct): string {
    return product.productoId;
  }

  formatPrice(value: number): string {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(value);
  }

  async agregarAlCarrito(product: StoreProduct | null = this.product): Promise<void> {
    if (!this.store || !product?.disponible) {
      return;
    }

    // Validar cantidad mínima para productos por kilo
    if (product.unidadVenta === 'kilo' && product.minimoKilos && product.productoId === this.product?.productoId) {
      if (this.cantidad < product.minimoKilos) {
        await Swal.fire({
          icon: 'warning',
          title: 'Cantidad insuficiente',
          text: `El mínimo permitido para comprar es ${product.minimoKilos} kg.`,
          confirmButtonText: 'Entendido',
        });
        return;
      }
    }

    const agregado = this.carritoService.agregarItem(
      {
        productoId: product.productoId,
        tiendaId: String(this.store.id),
        nombre: product.name,
        precio: product.priceValue,
        imagen: product.image,
        cantidad: product.productoId === this.product?.productoId ? this.cantidad : 1,
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
