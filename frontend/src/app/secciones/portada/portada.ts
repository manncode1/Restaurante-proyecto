import { Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Configuracion } from '../../services/configuracion';
import { irASeccion } from '../../shared/navegacion';

@Component({
  selector: 'app-portada',
  imports: [MatButtonModule],
  templateUrl: './portada.html',
  styleUrl: './portada.scss',
})
export class Portada {
  protected readonly sitio = inject(Configuracion).sitio;
  protected readonly irASeccion = irASeccion;

  /** Valor para la variable CSS --portada. La ruta es relativa al <base href>, así funciona también en subcarpetas. */
  protected readonly fondo = computed(() => {
    const imagen = this.sitio().portada_imagen.replace(/["\\]/g, '');
    return imagen ? `url("${imagen}")` : 'none';
  });
}
