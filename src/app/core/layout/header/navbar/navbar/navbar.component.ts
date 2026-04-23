import { Component, ElementRef, HostListener, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from '../../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { CarritoService } from '../../../../services/carrito.service';
import { PedidosService } from '../../../../services/pedidos.service';

interface NavItem {
  label: string;
  path: string;
  exact?: boolean;
}

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly carritoService = inject(CarritoService);
  private readonly pedidosService = inject(PedidosService);
  user: any;
  profileMenuOpen = false;
  mobileMenuOpen = false;
  totalAdeudadoTienda = 0;
  readonly exactLinkActiveOptions = { exact: true };
  readonly partialLinkActiveOptions = { exact: false };
  readonly cantidadCarrito$ = this.carritoService.items$.pipe(
    map((items) => items.reduce((sum, item) => sum + item.cantidad, 0)),
  );
  readonly primaryNavItems: NavItem[] = [
    { label: 'Inicio', path: '/', exact: true },
    { label: 'Tiendas', path: '/tiendas' },
    { label: 'Ser parte', path: '/colaboradores' },
  ];

  constructor(private authService: AuthService,
    private router: Router
  ) { }


  ngOnInit() {
    this.authService.user$.subscribe(user => {
      this.user = user;
      void this.cargarCobrosTienda();
    });

    if (this.authService.isLogged()) {
      void this.authService.refreshCurrentUser().catch((error) => {
        console.warn('No se pudo refrescar el usuario en navbar:', error);
      });
    }
  }

  toggleProfileMenu(): void {
    this.profileMenuOpen = !this.profileMenuOpen;
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeProfileMenu(): void {
    this.profileMenuOpen = false;
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
  }

  irAlCarrito(): void {
    this.closeProfileMenu();
    this.closeMobileMenu();
    this.router.navigate(['/carrito']);
  }

  @HostListener('document:click', ['$event'])
  handleDocumentClick(event: MouseEvent): void {
    const target = event.target as Node | null;

    if (!target) {
      return;
    }

    if (!this.elementRef.nativeElement.contains(target)) {
      this.closeProfileMenu();
    }
  }

  @HostListener('document:keydown.escape')
  handleEscape(): void {
    this.closeProfileMenu();
    this.closeMobileMenu();
  }

  logout() {
    this.closeProfileMenu();
    this.closeMobileMenu();
    this.authService.logout();
    //this.router.navigate(['/']);
  }

  trackByPath(_index: number, item: NavItem): string {
    return item.path;
  }

  get esUnaTienda(): boolean {
    return this.user?.esTienda === true;
  }

  get estadoSolicitudTienda(): string {
    return `${this.user?.estadoSolicitudTienda || ''}`.toLowerCase();
  }

  get mostrarOpcionesTienda(): boolean {
    return this.esUnaTienda && this.estadoSolicitudTienda !== 'rechazada';
  }

  get mostrarCobrosSitio(): boolean {
    return this.mostrarOpcionesTienda || this.totalAdeudadoTienda > 0;
  }

  get esAdministrador(): boolean {
    const roles = Array.isArray(this.user?.roles)
      ? this.user.roles
      : typeof this.user?.role === 'string'
        ? [this.user.role]
        : [];

    const normalizedRoles = roles.map((role: string) => role.toLowerCase());

    return normalizedRoles.includes('admin') || normalizedRoles.includes('administrador');
  }

  private async cargarCobrosTienda(): Promise<void> {
    if (!this.esUnaTienda) {
      this.totalAdeudadoTienda = 0;
      return;
    }

    try {
      const response = await this.pedidosService.getMisCobrosTienda();
      this.totalAdeudadoTienda = Number(response?.resumen?.totalAdeudado ?? 0);
    } catch (error) {
      console.warn('No se pudo cargar el resumen de cobros en navbar:', error);
      this.totalAdeudadoTienda = 0;
    }
  }

}
