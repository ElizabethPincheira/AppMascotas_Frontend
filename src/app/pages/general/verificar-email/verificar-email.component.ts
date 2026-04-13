import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { UsersService } from '../../../core/services/users.service';

@Component({
  selector: 'app-verificar-email',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './verificar-email.component.html',
  styleUrls: ['./verificar-email.component.css']
})
export class VerificarEmailComponent {
  estado: 'cargando' | 'exito' | 'error' = 'cargando';
  mensaje = 'Estamos validando tu correo...';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  async ngOnInit(): Promise<void> {
    const token = this.route.snapshot.queryParamMap.get('token')?.trim();

    if (!token) {
      this.estado = 'error';
      this.mensaje = 'El enlace de verificación no es válido o está incompleto.';
      return;
    }

    try {
      const response = await this.usersService.verifyEmail(token);
      this.estado = 'exito';
      this.mensaje = response?.message || 'Tu cuenta fue verificada correctamente.';

      if (this.authService.isLogged()) {
        await this.authService.refreshCurrentUser();
      }
    } catch (error: any) {
      this.estado = 'error';
      this.mensaje = error?.response?.data?.message || 'No pudimos verificar tu cuenta con este enlace.';
    }
  }
}
