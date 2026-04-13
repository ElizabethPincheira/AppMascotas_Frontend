import { Component, ElementRef, HostListener, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from '../../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { CarritoService } from '../../../../services/carrito.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly carritoService = inject(CarritoService);
  user: any;
  profileMenuOpen = false;
  mobileMenuOpen = false;
  readonly cantidadCarrito$ = this.carritoService.items$.pipe(
    map((items) => items.reduce((sum, item) => sum + item.cantidad, 0)),
  );
  readonly navItems = [
    { label: 'Inicio', path: '/', exact: true },
    { label: 'Perdidos', path: '/perdidos' },
    { label: 'Adopcion', path: '/adopcion' },
    { label: 'En calle', path: '/situacion-de-calle' },
    { label: 'Tiendas', path: '/tiendas' },
    { label: 'Ser parte', path: '/colaboradores' },
    //{ label: 'Fauna', path: '/fauna' },
    //{ label: 'Donar', path: '/donar' },
  ];

  constructor(private authService: AuthService,
    private router: Router
  ) { }


  ngOnInit() {
    this.authService.user$.subscribe(user => {
      this.user = user;
    });
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

  get esUnaTienda(): boolean {
    return this.user?.esTienda === true;
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

}
