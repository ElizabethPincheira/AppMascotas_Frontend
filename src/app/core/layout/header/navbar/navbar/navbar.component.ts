import { Component } from '@angular/core';
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
  user: any;
  readonly navItems = [
    { label: 'Inicio', path: '/', exact: true },
    { label: 'Perdidos', path: '/perdidos' },
    { label: 'Adopcion', path: '/adopcion' },
    { label: 'Tienda', path: '/tienda' },
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

  logout() {
    this.authService.logout();
    //this.router.navigate(['/']);
  }

}
