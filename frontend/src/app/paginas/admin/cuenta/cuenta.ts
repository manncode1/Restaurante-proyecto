import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Admin, mensajeError } from '../../../services/admin';

// Sin diseño a propósito: solo la funcionalidad.
@Component({
  selector: 'app-cuenta',
  imports: [FormsModule],
  templateUrl: './cuenta.html',
})
export class Cuenta {
  private readonly admin = inject(Admin);

  protected datos = { usuario: '', password_actual: '', password_nueva: '', confirmar: '' };

  protected readonly cargado = signal(false);
  protected readonly guardando = signal(false);
  protected readonly mensaje = signal('');
  protected readonly error = signal('');

  constructor() {
    this.admin.usuarioActual().subscribe({
      next: ({ usuario }) => {
        this.datos.usuario = usuario;
        this.cargado.set(true);
      },
      error: (e) => this.error.set(mensajeError(e)),
    });
  }

  protected guardar(evento: Event): void {
    evento.preventDefault();
    this.mensaje.set('');
    this.error.set('');

    if (this.datos.password_nueva !== this.datos.confirmar) {
      this.error.set('La contraseña nueva y su confirmación no coinciden.');
      return;
    }

    this.guardando.set(true);
    const { confirmar, ...datos } = this.datos;
    this.admin.guardarCuenta(datos).subscribe({
      next: ({ usuario }) => {
        this.datos = { usuario, password_actual: '', password_nueva: '', confirmar: '' };
        this.guardando.set(false);
        this.mensaje.set('Cuenta actualizada.');
      },
      error: (e) => {
        this.guardando.set(false);
        this.error.set(mensajeError(e));
      },
    });
  }
}
