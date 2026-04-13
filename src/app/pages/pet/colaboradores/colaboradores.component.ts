import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-colaboradores',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './colaboradores.component.html',
  styleUrls: ['./colaboradores.component.css']
})
export class ColaboradoresComponent implements OnInit, OnDestroy {
  estaLogueado = false;
  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.estaLogueado = this.authService.isLogged();

    this.authService.user$
      .pipe(takeUntil(this.destroy$))
      .subscribe(usuario => {
        this.estaLogueado = !!usuario || this.authService.isLogged();
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  scrollAlProceso() {
    const element = document.getElementById('proceso-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  irAlFormulario(areaId?: string) {
    this.router.navigate(['/colaboradores/postulacion'], {
      queryParams: areaId ? { area: areaId } : undefined
    });
  }

  readonly collaborationAreas = [
    {
      id: 'reparto',
      title: 'Venta y reparto de alimento',
      text: 'Tiendas o personas que quieran repartir alimento a domicilio. Quienes participen en esta categoría podrán aparecer luego en la pestaña Tienda.',
      tag: 'Conexión con Tienda'
    },
    {
      id: 'veterinario',
      title: 'Servicios veterinarios',
      text: 'Veterinarios, clínicas o profesionales independientes que quieran ofrecer consultas, vacunación, orientación o apoyo en urgencias.',
      tag: 'Salud animal'
    },
    {
      id: 'buscador',
      title: 'Buscadores de mascotas perdidas',
      text: 'Personas que en sus tiempos libres quieran ayudar a recorrer zonas, pegar avisos, difundir casos y apoyar búsquedas activas.',
      tag: 'Ayuda comunitaria'
    },
    {
      id: 'acogida',
      title: 'Casas de acogida temporal',
      text: 'Hogares dispuestos a recibir animales por un tiempo mientras encuentran familia, se recuperan o esperan adopción.',
      tag: 'Acogida solidaria'
    }
  ];

  readonly processSteps = [
    'Te registras como parte de la red de ayuda.',
    'Tu perfil queda asociado al tipo de colaboración que puedes ofrecer.',
    'Más adelante podrás ser visible en la plataforma según tu zona y servicio.'
  ];
}
