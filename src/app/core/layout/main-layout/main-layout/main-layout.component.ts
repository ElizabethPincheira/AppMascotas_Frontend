import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import Swal from 'sweetalert2';
import { AuthService } from '../../../services/auth.service';
import { UsersService } from '../../../services/users.service';
import { FooterComponent } from '../../footer/footer.component';
import { HeaderComponent } from '../../header/header.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-main-layout',
  imports: [CommonModule, HeaderComponent, FooterComponent, RouterOutlet],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css'
})
export class MainLayoutComponent {
  private readonly authService = inject(AuthService);
  private readonly usersService = inject(UsersService);

  user = this.authService.getUser();
  readonly verificationBanner$ = this.authService.verificationBanner$;
  reenviandoVerificacion = false;

  ngOnInit(): void {
    this.authService.user$.subscribe((user) => {
      this.user = user;
    });
  }

  async reenviarVerificacion(): Promise<void> {
    if (!this.user?.email) {
      return;
    }

    this.reenviandoVerificacion = true;

    try {
      await this.usersService.resendVerificationEmail(this.user.email);
      await Swal.fire({
        icon: 'success',
        title: 'Correo reenviado',
        text: 'Si tu cuenta sigue pendiente, te enviaremos un nuevo email de verificación.',
        confirmButtonText: 'Continuar',
      });
    } catch (error: any) {
      await Swal.fire({
        icon: 'error',
        title: 'No se pudo reenviar',
        text: error?.response?.data?.message || 'Ocurrió un problema al reenviar el correo de verificación.',
        confirmButtonText: 'Entendido',
      });
    } finally {
      this.reenviandoVerificacion = false;
    }
  }
}
