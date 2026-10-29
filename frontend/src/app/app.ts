import { Component } from '@angular/core';
import { Carta } from './secciones/carta/carta';
import { Contacto } from './secciones/contacto/contacto';
import { Navegacion } from './secciones/navegacion/navegacion';
import { Nosotros } from './secciones/nosotros/nosotros';
import { PieDePagina } from './secciones/pie-de-pagina/pie-de-pagina';
import { Portada } from './secciones/portada/portada';

@Component({
  selector: 'app-root',
  imports: [Navegacion, Portada, Nosotros, Carta, Contacto, PieDePagina],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {}
