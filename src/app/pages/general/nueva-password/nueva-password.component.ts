import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { UsersService } from '../../../core/services/users.service';

@Component({
  selector: 'app-nueva-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './nueva-password.component.html',
  styleUrls: ['./nueva-password.component.css']
})
export class NuevaPasswordComponent {
  password = '';
  confirmPassword = '';
  token = '';
  enviandoFormulario = false;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly usersService: UsersService,
  ) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token')?.trim() || '';
  }

  get passwordsMatch(): boolean {
    return !!this.password && this.password === this.confirmPassword;
  }

  get formularioCompleto(): boolean {
    return !!(this.token && this.password.trim() && this.confirmPassword.trim() && this.passwordsMatch);
  }

  async guardarNuevaPassword(): Promise<void> {
    if (!this.formularioCompleto) {
      return;
    }

    this.enviandoFormulario = true;

    try {
      await this.usersService.resetPassword(this.token, this.password.trim());

      await Swal.fire({
        icon: 'success',
        title: 'Contraseña actualizada',
        text: 'Tu contraseña fue cambiada correctamente. Ya puedes iniciar sesión.',
        confirmButtonText: 'Continuar',
      });

      await this.router.navigate(['/login']);
    } catch (error: any) {
      await Swal.fire({
        icon: 'error',
        title: 'No se pudo actualizar',
        text: error?.response?.data?.message || 'El enlace no es válido o ya expiró.',
        confirmButtonText: 'Entendido',
      });
    } finally {
      this.enviandoFormulario = false;
    }
  }
}
