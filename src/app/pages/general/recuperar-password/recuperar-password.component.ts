import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { UsersService } from '../../../core/services/users.service';

@Component({
  selector: 'app-recuperar-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './recuperar-password.component.html',
  styleUrls: ['./recuperar-password.component.css']
})
export class RecuperarPasswordComponent {
  email = '';
  enviandoFormulario = false;
  solicitudEnviada = false;

  constructor(private readonly usersService: UsersService) {}

  get formularioCompleto(): boolean {
    return !!this.email.trim();
  }

  async enviarInstrucciones(): Promise<void> {
    this.enviandoFormulario = true;

    try {
      await this.usersService.requestPasswordRecovery(this.email.trim());
      this.solicitudEnviada = true;

      await Swal.fire({
        icon: 'success',
        title: 'Revisa tu correo',
        text: 'Si ese correo está registrado, recibirás un email con instrucciones.',
        confirmButtonText: 'Continuar',
      });
    } catch (error: any) {
      await Swal.fire({
        icon: 'error',
        title: 'No se pudo procesar',
        text: error?.response?.data?.message || 'Ocurrió un problema al enviar las instrucciones.',
        confirmButtonText: 'Entendido',
      });
    } finally {
      this.enviandoFormulario = false;
    }
  }
}
