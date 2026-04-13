import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import axios from 'axios';
import { environment } from '../../../../environments/environment';
import Swal from 'sweetalert2';
import { AuthService } from '../../../core/services/auth.service';

export enum TipoColaboracion {
  REPARTO = 'reparto',
  VETERINARIO = 'veterinario',
  BUSCADOR = 'buscador',
  ACOGIDA = 'acogida',
}

export enum EstadoPostulacion {
  PENDIENTE = 'pendiente',
  CONTACTADO = 'contactado',
  ACTIVO = 'activo',
  RECHAZADO = 'rechazado',
}

interface Colaborador {
  _id: string;
  nombre: string;
  email: string;
  telefono: string;
  region: string;
  provincia: string;
  comuna: string;
  tipos: TipoColaboracion[];
  descripcion?: string;
  estado: EstadoPostulacion;
  usuarioId?: string;
  fechaPostulacion: Date;
}

interface ColaboradoresResponse {
  data: Colaborador[];
  total: number;
  page: number;
  limit: number;
}

@Component({
  selector: 'app-admin-colaboradores',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-colaboradores.component.html',
  styleUrl: './admin-colaboradores.component.css',
})
export class AdminColaboradoresComponent implements OnInit, OnDestroy {
  private readonly authService = inject(AuthService);
  colaboradores: Colaborador[] = [];
  colaboradoresBackup: Colaborador[] = [];
  cargando = false;
  actualizando: { [key: string]: boolean } = {};

  // Filtros
  filtroEstado: EstadoPostulacion | 'todos' = 'todos';
  filtroTipo: TipoColaboracion | 'todos' = 'todos';
  page = 1;
  limit = 20;

  // Estados
  estados: EstadoPostulacion[] = [
    EstadoPostulacion.PENDIENTE,
    EstadoPostulacion.CONTACTADO,
    EstadoPostulacion.ACTIVO,
    EstadoPostulacion.RECHAZADO,
  ];

  tipos: TipoColaboracion[] = [
    TipoColaboracion.REPARTO,
    TipoColaboracion.VETERINARIO,
    TipoColaboracion.BUSCADOR,
    TipoColaboracion.ACOGIDA,
  ];

  estadoConfig: Record<EstadoPostulacion, any> = {
    [EstadoPostulacion.PENDIENTE]: {
      label: 'Pendiente',
      class: 'estado-pendiente',
      icon: '⏰',
    },
    [EstadoPostulacion.CONTACTADO]: {
      label: 'Contactado',
      class: 'estado-contactado',
      icon: '📧',
    },
    [EstadoPostulacion.ACTIVO]: {
      label: 'Activo',
      class: 'estado-activo',
      icon: '✅',
    },
    [EstadoPostulacion.RECHAZADO]: {
      label: 'Rechazado',
      class: 'estado-rechazado',
      icon: '❌',
    },
  };

  tipoConfig: Record<TipoColaboracion, any> = {
    [TipoColaboracion.REPARTO]: {
      label: 'Reparto',
      class: 'tipo-reparto',
    },
    [TipoColaboracion.VETERINARIO]: {
      label: 'Veterinario',
      class: 'tipo-veterinario',
    },
    [TipoColaboracion.BUSCADOR]: {
      label: 'Buscador',
      class: 'tipo-buscador',
    },
    [TipoColaboracion.ACOGIDA]: {
      label: 'Acogida',
      class: 'tipo-acogida',
    },
  };

  ngOnInit() {
    this.cargarColaboradores();
  }

  ngOnDestroy() {
    // Cleanup si es necesario
  }

  async cargarColaboradores() {
    const token = this.authService.getToken();

    if (!token) {
      await Swal.fire({
        icon: 'warning',
        title: 'Sesión expirada',
        text: 'Debes iniciar sesión nuevamente para ver las postulaciones.',
      });
      return;
    }

    this.cargando = true;
    try {
      const params: any = {
        page: this.page,
        limit: this.limit,
      };

      if (this.filtroEstado !== 'todos') {
        params.estado = this.filtroEstado;
      }

      if (this.filtroTipo !== 'todos') {
        params.tipo = this.filtroTipo;
      }

      const response = await axios.get<ColaboradoresResponse>(
        `${environment.apiUrl}colaboradores`,
        {
          params,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      this.colaboradores = response.data.data;
      this.colaboradoresBackup = [...this.colaboradores];
    } catch (error: any) {
      console.error('Error al cargar colaboradores:', error);

      const status = error?.response?.status;
      const message =
        status === 401
          ? 'Tu sesión expiró o no es válida.'
          : status === 403
          ? 'No tienes permisos de administrador para ver estas postulaciones.'
          : 'No se pudieron cargar las postulaciones';

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: message,
      });
    } finally {
      this.cargando = false;
    }
  }

  async cambiarEstado(
    colaboradorId: string,
    nuevoEstado: string
  ) {
    const token = this.authService.getToken();

    if (!token) {
      await Swal.fire({
        icon: 'warning',
        title: 'Sesión expirada',
        text: 'Debes iniciar sesión nuevamente para actualizar postulaciones.',
      });
      return;
    }

    const estadoMap: Record<string, EstadoPostulacion> = {
      contactado: EstadoPostulacion.CONTACTADO,
      activo: EstadoPostulacion.ACTIVO,
      rechazado: EstadoPostulacion.RECHAZADO,
    };

    const estado = estadoMap[nuevoEstado] as EstadoPostulacion;

    const colaborador = this.colaboradores.find((c) => c._id === colaboradorId);
    if (!colaborador) return;

    const confirmacion = await Swal.fire({
      icon: 'question',
      title: `Cambiar estado a "${this.estadoConfig[estado].label}"`,
      text: `¿Cambiar el estado de ${colaborador.nombre} a ${this.estadoConfig[estado].label}?`,
      showCancelButton: true,
      confirmButtonText: 'Sí, cambiar',
      cancelButtonText: 'Cancelar',
    });

    if (!confirmacion.isConfirmed) return;

    this.actualizando[colaboradorId] = true;

    try {
      await axios.patch(
        `${environment.apiUrl}colaboradores/${colaboradorId}/estado`,
        { estado: estado },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Actualizar localmente
      const idx = this.colaboradores.findIndex((c) => c._id === colaboradorId);
      if (idx >= 0) {
        this.colaboradores[idx].estado = estado;
      }

      Swal.fire({
        icon: 'success',
        title: 'Actualizado',
        text: `Estado actualizado a ${this.estadoConfig[estado].label}`,
        timer: 2000,
      });
    } catch (error: any) {
      console.error('Error al actualizar estado:', error);

      const status = error?.response?.status;
      const message =
        status === 401
          ? 'Tu sesión expiró o no es válida.'
          : status === 403
          ? 'No tienes permisos de administrador para cambiar este estado.'
          : 'No se pudo actualizar el estado';

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: message,
      });
    } finally {
      this.actualizando[colaboradorId] = false;
    }
  }

  async filtrarPorEstado(estado: string | 'todos') {
    this.filtroEstado = estado as EstadoPostulacion | 'todos';
    this.page = 1;
    await this.cargarColaboradores();
  }

  async filtrarPorTipo(tipo: string | 'todos') {
    this.filtroTipo = tipo as TipoColaboracion | 'todos';
    this.page = 1;
    await this.cargarColaboradores();
  }

  formatFecha(fecha: Date | string): string {
    const date = new Date(fecha);
    const meses = [
      'ene',
      'feb',
      'mar',
      'abr',
      'may',
      'jun',
      'jul',
      'ago',
      'sep',
      'oct',
      'nov',
      'dic',
    ];
    const dia = date.getDate();
    const mes = meses[date.getMonth()];
    const año = date.getFullYear();
    return `${dia} ${mes} ${año}`;
  }

  getTipoLabel(tipo: TipoColaboracion): string {
    return this.tipoConfig[tipo]?.label || tipo;
  }

  getEstadoLabel(estado: EstadoPostulacion): string {
    return this.estadoConfig[estado]?.label || estado;
  }

  getEstadoIcon(estado: EstadoPostulacion): string {
    return this.estadoConfig[estado]?.icon || '';
  }

  mostrarDetalles(colaborador: Colaborador) {
    const tiposTexto =
      Array.isArray(colaborador.tipos) && colaborador.tipos.length > 0
        ? colaborador.tipos.map((tipo) => this.getTipoLabel(tipo)).join(', ')
        : 'No especificó';

    Swal.fire({
      icon: 'info',
      title: 'Detalles de la postulación',
      html: `
        <div style="text-align: left;">
          <p><strong>Nombre:</strong> ${colaborador.nombre}</p>
          <p><strong>Email:</strong> ${colaborador.email}</p>
          <p><strong>Teléfono:</strong> ${colaborador.telefono}</p>
          <p><strong>Zona:</strong> ${colaborador.region} / ${colaborador.provincia} / ${colaborador.comuna}</p>
          <p><strong>Tipo de colaboración:</strong> ${tiposTexto}</p>
          <p><strong>Descripción:</strong></p>
          <p>${colaborador.descripcion || 'No especificó'}</p>
        </div>
      `,
      confirmButtonText: 'Cerrar',
    });
  }

  puedeCambiar(
    estado: EstadoPostulacion,
    colaboradorEstado: EstadoPostulacion
  ): boolean {
    // No puedes cambiar al mismo estado
    if (estado === colaboradorEstado) return false;
    
    // Si está rechazado, solo puedes cambiar a contactado o activo
    if (colaboradorEstado === EstadoPostulacion.RECHAZADO) {
      return false;
    }
    
    return true;
  }

  get tituloHeader(): string {
    let titulo = 'Postulaciones de colaboradores';
    
    if (this.filtroEstado !== 'todos') {
      titulo += ` - ${this.getEstadoLabel(this.filtroEstado as EstadoPostulacion)}`;
    }
    
    if (this.filtroTipo !== 'todos') {
      titulo += ` - ${this.getTipoLabel(this.filtroTipo as TipoColaboracion)}`;
    }
    
    return titulo;
  }

  get totalPostulaciones(): number {
    return this.colaboradores.length;
  }

  get estaVacio(): boolean {
    return !this.cargando && this.colaboradores.length === 0;
  }

  get mensajeVacio(): string {
    if (this.filtroEstado !== 'todos' || this.filtroTipo !== 'todos') {
      return `No hay postulaciones ${this.filtroEstado !== 'todos' ? this.getEstadoLabel(this.filtroEstado as EstadoPostulacion).toLowerCase() : ''} ${this.filtroTipo !== 'todos' ? this.getTipoLabel(this.filtroTipo as TipoColaboracion).toLowerCase() : ''} por ahora.`;
    }
    return 'No hay postulaciones por ahora.';
  }
}
