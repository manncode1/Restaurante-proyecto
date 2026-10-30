import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Configuracion } from '../../services/configuracion';
import { irASeccion } from '../../shared/navegacion';

@Component({
  selector: 'app-navegacion',
  imports: [MatButtonModule, MatToolbarModule],
  templateUrl: './navegacion.html',
  styleUrl: './navegacion.scss',
})
export class Navegacion {
  protected readonly sitio = inject(Configuracion).sitio;

  protected readonly enlaces = [
    { id: 'inicio', texto: 'Inicio' },
    { id: 'nosotros', texto: 'Nosotros' },
    { id: 'menu', texto: 'Menú' },
    { id: 'contacto', texto: 'Contacto' },
  ];

  protected readonly menuMovilAbierto = signal(false);

  protected navegar(id: string): void {
    this.menuMovilAbierto.set(false);
    irASeccion(id);
  }
}
