import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { UsersService } from '../../../core/services/users.service';

interface AdminShortcut {
  title: string;
  description: string;
  path: string;
}

interface AdminStatCard {
  label: string;
  value: number;
  accent: 'amber' | 'green' | 'blue' | 'teal' | 'rose';
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent {
  private readonly authService = inject(AuthService);
  private readonly usersService = inject(UsersService);

  readonly user = this.authService.getUser();
  cargandoStats = true;
  stats: AdminStatCard[] = [];
  readonly shortcuts: AdminShortcut[] = [
    {
      title: 'Ver usuarios',
      description: 'Consulta los usuarios registrados, sus roles y si cuentan con tienda activa.',
      path: '/admin/usuarios',
    },
    {
      title: 'Gestionar tiendas',
      description: 'Revisa solicitudes pendientes, aprueba negocios y registra rechazos con contexto.',
      path: '/admin/tiendas',
    },
    {
      title: 'Gestionar publicaciones',
      description: 'Consulta los casos activos y verifica el contenido que aparece en la plataforma.',
      path: '/mis-mascotas',
    },
    {
      title: 'Gestionar colaboradores',
      description: 'Revisa y gestiona las postulaciones de colaboradores recibidas.',
      path: '/admin/colaboradores',
    },
    {
      title: 'Cobros de tiendas',
      description: 'Consulta montos adeudados, pagos registrados y marca cobros como pagados.',
      path: '/admin/cobros-tiendas',
    },
    {
      title: 'Ver cuenta',
      description: 'Abre tu panel personal para actualizar tus datos o cambiar de seccion rapidamente.',
      path: '/mi-cuenta',
    },
  ];

  async ngOnInit(): Promise<void> {
    try {
      const response = await this.usersService.getAdminStats();

      this.stats = [
        {
          label: 'Mascotas activas',
          value: Number(response?.totalMascotasActivas ?? 0),
          accent: 'amber',
        },
        {
          label: 'Resueltas este mes',
          value: Number(response?.totalMascotasResueltasEsteMes ?? 0),
          accent: 'green',
        },
        {
          label: 'Usuarios registrados',
          value: Number(response?.totalUsuariosRegistrados ?? 0),
          accent: 'blue',
        },
        {
          label: 'Tiendas aprobadas',
          value: Number(response?.totalTiendasAprobadas ?? 0),
          accent: 'teal',
        },
        {
          label: 'Tiendas pendientes',
          value: Number(response?.totalTiendasPendientes ?? 0),
          accent: 'rose',
        },
      ];
    } finally {
      this.cargandoStats = false;
    }
  }

  get displayName(): string {
    return this.user?.nombre || this.user?.name || this.user?.username || 'Administrador';
  }

  formatStat(value: number): string {
    return new Intl.NumberFormat('es-CL').format(value);
  }
}
