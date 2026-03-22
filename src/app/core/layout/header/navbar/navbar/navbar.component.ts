import { Component, ElementRef, HostListener, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  user: any;
  profileMenuOpen = false;
  mobileMenuOpen = false;
  readonly navItems = [
    { label: 'Inicio', path: '/', exact: true },
    { label: 'Perdidos', path: '/perdidos' },
    { label: 'Adopcion', path: '/adopcion' },
    { label: 'Tienda', path: '/tienda' },
    { label: 'Ser parte', path: '/colaboradores' },
    { label: 'Fauna', path: '/fauna' },
    { label: 'Donar', path: '/donar' },
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

}
