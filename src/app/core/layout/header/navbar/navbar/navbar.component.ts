import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router'; 
import { ButtonLoginComponent } from '../../../../../shared/atoms/button-login/button-login.component';
import { AuthService } from '../../../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, ButtonLoginComponent, CommonModule], 
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {

  user: any;

  constructor(private authService: AuthService) {}


  ngOnInit() {
    this.user = this.authService.getUser();
  }


}


