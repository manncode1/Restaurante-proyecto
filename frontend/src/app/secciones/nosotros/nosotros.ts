import { Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Configuracion } from '../../services/configuracion';
import { irASeccion } from '../../shared/navegacion';

@Component({
  selector: 'app-nosotros',
  imports: [MatButtonModule],
  templateUrl: './nosotros.html',
  styleUrl: './nosotros.scss',
})
export class Nosotros {
  protected readonly sitio = inject(Configuracion).sitio;
  protected readonly irASeccion = irASeccion;

  /** Letra decorativa: la inicial del nombre del restaurante. */
  protected readonly inicial = computed(
    () => this.sitio().nombre.trim().charAt(0).toUpperCase() || '✦',
  );
}
