import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Configuracion } from '../../services/configuracion';
import { irASeccion } from '../../shared/navegacion';

@Component({
  selector: 'app-portada',
  imports: [MatButtonModule],
  templateUrl: './portada.html',
  styleUrl: './portada.scss'
})
export class Portada {
  protected readonly sitio = inject(Configuracion).sitio;
  protected readonly irASeccion = irASeccion;
}
