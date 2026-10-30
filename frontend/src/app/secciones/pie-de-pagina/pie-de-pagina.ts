import { Component, inject } from '@angular/core';
import { Configuracion } from '../../services/configuracion';
import { irASeccion } from '../../shared/navegacion';

@Component({
  selector: 'app-pie-de-pagina',
  templateUrl: './pie-de-pagina.html',
  styleUrl: './pie-de-pagina.scss',
})
export class PieDePagina {
  protected readonly sitio = inject(Configuracion).sitio;
  protected readonly irASeccion = irASeccion;
  protected readonly anio = new Date().getFullYear();
}
