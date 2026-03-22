import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { NavbarComponent } from './navbar/navbar/navbar.component';
import { BannerComponent } from './banner/banner/banner.component';
import { filter } from 'rxjs';

@Component({
  selector: 'app-header',
  imports: [CommonModule, NavbarComponent, BannerComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  private readonly router = inject(Router);
  showBanner = this.isBannerRoute(this.router.url);

  ngOnInit(): void {
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.showBanner = this.isBannerRoute(event.urlAfterRedirects);
      });
  }

  private isBannerRoute(url: string): boolean {
    const cleanUrl = url.split('?')[0].split('#')[0];
    return cleanUrl === '/' || cleanUrl === '';
  }
}
