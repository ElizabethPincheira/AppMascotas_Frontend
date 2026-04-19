import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { UsersService } from '../../../core/services/users.service';

@Component({
  selector: 'app-verificar-email',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './verificar-email.component.html',
  styleUrls: ['./verificar-email.component.css']
})
export class VerificarEmailComponent {
  estado: 'ingreso' | 'cargando' | 'exito' | 'error' = 'ingreso';
  mensaje = 'Ingresa el correo y el codigo que te enviamos para verificar tu cuenta.';
  email = '';
  codigo = '';
  procesando = false;
  reenviando = false;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  async ngOnInit(): Promise<void> {
    this.email = this.route.snapshot.queryParamMap.get('email')?.trim() || '';
    const token = this.route.snapshot.queryParamMap.get('token')?.trim();

    if (!token) {
      return;
    }

    this.estado = 'cargando';
    this.mensaje = 'Estamos validando tu correo...';

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

  async confirmarCodigo(): Promise<void> {
    if (!this.email.trim() || !this.codigoNormalizado) {
      return;
    }

    this.procesando = true;
    this.estado = 'cargando';
    this.mensaje = 'Estamos validando tu codigo...';

    try {
      const response = await this.usersService.verifyEmailCode(
        this.email.trim(),
        this.codigoNormalizado,
      );

      this.estado = 'exito';
      this.mensaje = response?.message || 'Tu cuenta fue verificada correctamente.';

      if (this.authService.isLogged()) {
        await this.authService.refreshCurrentUser();
      }
    } catch (error: any) {
      this.estado = 'error';
      this.mensaje = error?.response?.data?.message || 'No pudimos verificar tu cuenta con ese codigo.';
    } finally {
      this.procesando = false;
    }
  }

  async reenviarCodigo(): Promise<void> {
    if (!this.email.trim()) {
      this.estado = 'error';
      this.mensaje = 'Ingresa tu correo para reenviar un nuevo codigo.';
      return;
    }

    this.reenviando = true;

    try {
      const response = await this.usersService.resendVerificationEmail(this.email.trim());
      this.estado = 'ingreso';
      this.mensaje = response?.message || 'Si tu cuenta sigue pendiente, enviaremos un nuevo codigo.';
    } catch (error: any) {
      this.estado = 'error';
      this.mensaje = error?.response?.data?.message || 'No pudimos reenviar el codigo de verificacion.';
    } finally {
      this.reenviando = false;
    }
  }

  get codigoNormalizado(): string {
    return this.codigo.replace(/\s+/g, '').trim();
  }
}
