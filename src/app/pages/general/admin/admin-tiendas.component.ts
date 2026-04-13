import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { UsersService } from '../../../core/services/users.service';

type StoreTab = 'pendiente' | 'aprobada' | 'rechazada';

interface AdminStore {
  _id: string;
  nombre?: string;
  email?: string;
  nombreTienda: string;
  regionTienda?: string;
  provinciaTienda?: string;
  comunaTienda?: string;
  categoriasTienda?: string[];
  estadoSolicitudTienda?: string;
  fechaSolicitudTienda?: string;
  createdAt?: string;
  motivoRechazoTienda?: string;
}

@Component({
  selector: 'app-admin-tiendas',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-tiendas.component.html',
  styleUrl: './admin-tiendas.component.css'
})
export class AdminTiendasComponent {
  private readonly usersService = inject(UsersService);

  tiendas: AdminStore[] = [];
  cargandoTiendas = true;
  procesandoTiendaId: string | null = null;
  pestanaActiva: StoreTab = 'pendiente';

  async ngOnInit(): Promise<void> {
    await this.cargarTiendas();
  }

  get tabs(): Array<{ key: StoreTab; label: string; count: number }> {
    return [
      { key: 'pendiente', label: 'Pendientes', count: this.totalPorEstado('pendiente') },
      { key: 'aprobada', label: 'Aprobadas', count: this.totalPorEstado('aprobada') },
      { key: 'rechazada', label: 'Rechazadas', count: this.totalPorEstado('rechazada') },
    ];
  }

  get tiendasFiltradas(): AdminStore[] {
    return this.tiendas.filter((tienda) => this.normalizarEstado(tienda.estadoSolicitudTienda) === this.pestanaActiva);
  }

  get totalTiendas(): number {
    return this.tiendas.length;
  }

  get pendientesCount(): number {
    return this.totalPorEstado('pendiente');
  }

  formatOwner(store: AdminStore): string {
    return store.nombre?.trim() || store.email?.trim() || 'Sin dueño registrado';
  }

  formatLocation(store: AdminStore): string {
    return [store.comunaTienda, store.provinciaTienda, store.regionTienda].filter(Boolean).join(', ') || 'Sin ubicación';
  }

  formatCategories(store: AdminStore): string {
    return Array.isArray(store.categoriasTienda) && store.categoriasTienda.length > 0
      ? store.categoriasTienda.join(', ')
      : 'Sin categorías';
  }

  formatRequestDate(store: AdminStore): string {
    const rawDate = store.fechaSolicitudTienda || store.createdAt;

    if (!rawDate) {
      return 'Sin fecha';
    }

    return new Intl.DateTimeFormat('es-CL', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(rawDate));
  }

  async aprobarTienda(store: AdminStore): Promise<void> {
    const result = await Swal.fire({
      icon: 'question',
      title: '¿Aprobar esta tienda?',
      text: `La tienda ${store.nombreTienda} pasará a estar visible en el directorio público.`,
      showCancelButton: true,
      confirmButtonText: 'Aprobar',
      cancelButtonText: 'Cancelar',
    });

    if (!result.isConfirmed) {
      return;
    }

    await this.actualizarEstado(store, 'aprobada');
  }

  async rechazarTienda(store: AdminStore): Promise<void> {
    const result = await Swal.fire({
      icon: 'warning',
      title: 'Rechazar tienda',
      input: 'textarea',
      inputLabel: 'Motivo del rechazo',
      inputPlaceholder: 'Explica brevemente por qué la solicitud no puede aprobarse.',
      inputAttributes: {
        'aria-label': 'Motivo del rechazo',
      },
      showCancelButton: true,
      confirmButtonText: 'Rechazar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc2626',
      inputValidator: (value) => {
        if (!String(value || '').trim()) {
          return 'Debes indicar un motivo para rechazar la tienda.';
        }

        return null;
      },
    });

    if (!result.isConfirmed) {
      return;
    }

    await this.actualizarEstado(store, 'rechazada', String(result.value || '').trim());
  }

  seleccionarPestana(tab: StoreTab): void {
    this.pestanaActiva = tab;
  }

  trackByStoreId(_: number, tienda: AdminStore): string {
    return tienda._id;
  }

  private async cargarTiendas(): Promise<void> {
    this.cargandoTiendas = true;

    try {
      const response = await this.usersService.getAdminStores();
      this.tiendas = Array.isArray(response?.stores) ? response.stores : [];
    } finally {
      this.cargandoTiendas = false;
    }
  }

  private totalPorEstado(status: StoreTab): number {
    return this.tiendas.filter((tienda) => this.normalizarEstado(tienda.estadoSolicitudTienda) === status).length;
  }

  private normalizarEstado(status?: string): StoreTab {
    const normalizedStatus = String(status || 'pendiente').toLowerCase();

    if (normalizedStatus === 'aprobada' || normalizedStatus === 'rechazada') {
      return normalizedStatus;
    }

    return 'pendiente';
  }

  private async actualizarEstado(
    store: AdminStore,
    status: 'aprobada' | 'rechazada',
    motivoRechazo?: string,
  ): Promise<void> {
    this.procesandoTiendaId = store._id;

    try {
      const response = await this.usersService.updateAdminStoreStatus(store._id, status, motivoRechazo);
      const updatedStore = response?.store;

      this.tiendas = this.tiendas.map((item) =>
        item._id === store._id ? { ...item, ...updatedStore } : item
      );

      await Swal.fire({
        icon: 'success',
        title: status === 'aprobada' ? 'Tienda aprobada' : 'Tienda rechazada',
        text: response?.message || 'El estado de la tienda fue actualizado correctamente.',
        confirmButtonText: 'Continuar',
      });
    } catch (error: any) {
      await Swal.fire({
        icon: 'error',
        title: 'No se pudo actualizar',
        text: error?.response?.data?.message || 'Ocurrió un problema al cambiar el estado de la tienda.',
        confirmButtonText: 'Entendido',
      });
    } finally {
      this.procesandoTiendaId = null;
    }
  }
}
