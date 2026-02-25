import { Component } from '@angular/core';
import { NavbarComponent } from './navbar/navbar/navbar.component';
import { BannerComponent } from './banner/banner/banner.component';

@Component({
  selector: 'app-header',
  imports: [NavbarComponent,BannerComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {

}
