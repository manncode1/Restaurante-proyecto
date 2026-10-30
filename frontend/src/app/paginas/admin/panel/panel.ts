import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Auth } from '../../../services/auth';

// Página de entrada del panel con sus apartados. Sin diseño a propósito.
@Component({
  selector: 'app-panel',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './panel.html',
})
export class Panel {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);

  protected salir(): void {
    this.auth.logout().subscribe({
      complete: () => this.router.navigate(['/admin']),
      error: () => this.router.navigate(['/admin']),
    });
  }
}
