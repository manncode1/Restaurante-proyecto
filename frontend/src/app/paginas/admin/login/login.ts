import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '../../../services/auth';

// Sin diseño a propósito: solo la funcionalidad, el estilo lo agrega el equipo después.
@Component({
  selector: 'app-login',
  templateUrl: './login.html',
})
export class Login {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);

  protected readonly error = signal('');
  protected readonly enviando = signal(false);

  protected entrar(evento: Event, usuario: string, password: string): void {
    evento.preventDefault();
    this.error.set('');
    this.enviando.set(true);

    this.auth.login(usuario, password).subscribe({
      next: () => this.router.navigate(['/admin/menu']),
      error: (respuesta) => {
        this.enviando.set(false);
        this.error.set(
          respuesta.status === 401
            ? 'Usuario o contraseña incorrectos.'
            : 'No se pudo iniciar sesión. Intenta de nuevo.',
        );
      },
    });
  }
}
