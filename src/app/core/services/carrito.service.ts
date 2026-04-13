import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface CarritoItem {
  productoId: string;
  tiendaId: string;
  nombre: string;
  precio: number;
  imagen: string;
  cantidad: number;
}

@Injectable({
  providedIn: 'root'
})
export class CarritoService {
  private static readonly ITEMS_STORAGE_KEY = 'circulo-animal-carrito-items';
  private static readonly STORE_NAME_STORAGE_KEY = 'circulo-animal-carrito-tienda';
  private readonly itemsSubject = new BehaviorSubject<CarritoItem[]>([]);
  private tiendaActualNombre: string | null = null;

  constructor() {
    this.hidratarDesdeStorage();
  }

  get items$(): Observable<CarritoItem[]> {
    return this.itemsSubject.asObservable();
  }

  get items(): CarritoItem[] {
    return this.itemsSubject.value;
  }

  get total(): number {
    return this.itemsSubject.value.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
  }

  get cantidadTotal(): number {
    return this.itemsSubject.value.reduce((sum, item) => sum + item.cantidad, 0);
  }

  get nombreTienda(): string | null {
    return this.tiendaActualNombre;
  }

  get tiendaId(): string | null {
    return this.itemsSubject.value[0]?.tiendaId || null;
  }

  agregarItem(item: CarritoItem, nombreTienda: string): boolean {
    const itemsActuales = this.itemsSubject.value;
    const tiendaActualId = itemsActuales[0]?.tiendaId;

    if (tiendaActualId && tiendaActualId !== item.tiendaId) {
      const shouldReplace = window.confirm(
        `Tienes productos de ${this.tiendaActualNombre || 'otra tienda'}. ¿Vaciar y agregar de ${nombreTienda}?`,
      );

      if (!shouldReplace) {
        return false;
      }

      this.vaciarCarrito();
    }

    const itemsRefrescados = this.itemsSubject.value;
    const existingItemIndex = itemsRefrescados.findIndex((existingItem) => existingItem.productoId === item.productoId);

    if (existingItemIndex >= 0) {
      const updatedItems = [...itemsRefrescados];
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        cantidad: updatedItems[existingItemIndex].cantidad + item.cantidad,
      };
      this.itemsSubject.next(updatedItems);
    } else {
      this.itemsSubject.next([...itemsRefrescados, item]);
    }

    this.tiendaActualNombre = nombreTienda;
    this.persistir();
    return true;
  }

  quitarItem(productoId: string): void {
    const updatedItems = this.itemsSubject.value.filter((item) => item.productoId !== productoId);
    this.itemsSubject.next(updatedItems);

    if (updatedItems.length === 0) {
      this.tiendaActualNombre = null;
    }

    this.persistir();
  }

  cambiarCantidad(productoId: string, cantidad: number): void {
    if (cantidad <= 0) {
      this.quitarItem(productoId);
      return;
    }

    const updatedItems = this.itemsSubject.value.map((item) =>
      item.productoId === productoId
        ? { ...item, cantidad }
        : item,
    );

    this.itemsSubject.next(updatedItems);
    this.persistir();
  }

  vaciarCarrito(): void {
    this.itemsSubject.next([]);
    this.tiendaActualNombre = null;
    this.persistir();
  }

  private hidratarDesdeStorage(): void {
    if (typeof localStorage === 'undefined') {
      return;
    }

    try {
      const storedItems = localStorage.getItem(CarritoService.ITEMS_STORAGE_KEY);
      const storedStoreName = localStorage.getItem(CarritoService.STORE_NAME_STORAGE_KEY);

      if (storedItems) {
        const parsedItems = JSON.parse(storedItems) as CarritoItem[];

        if (Array.isArray(parsedItems)) {
          this.itemsSubject.next(parsedItems);
        }
      }

      this.tiendaActualNombre = storedStoreName?.trim() || null;
    } catch (error) {
      console.error('No se pudo recuperar el carrito desde localStorage:', error);
      this.itemsSubject.next([]);
      this.tiendaActualNombre = null;
    }
  }

  private persistir(): void {
    if (typeof localStorage === 'undefined') {
      return;
    }

    try {
      localStorage.setItem(
        CarritoService.ITEMS_STORAGE_KEY,
        JSON.stringify(this.itemsSubject.value),
      );

      if (this.tiendaActualNombre) {
        localStorage.setItem(
          CarritoService.STORE_NAME_STORAGE_KEY,
          this.tiendaActualNombre,
        );
      } else {
        localStorage.removeItem(CarritoService.STORE_NAME_STORAGE_KEY);
      }
    } catch (error) {
      console.error('No se pudo persistir el carrito en localStorage:', error);
    }
  }
}
