import { Component } from '@angular/core';
import { Carta } from '../../secciones/carta/carta';
import { Contacto } from '../../secciones/contacto/contacto';
import { Navegacion } from '../../secciones/navegacion/navegacion';
import { Nosotros } from '../../secciones/nosotros/nosotros';
import { PieDePagina } from '../../secciones/pie-de-pagina/pie-de-pagina';
import { Portada } from '../../secciones/portada/portada';

/** Página pública del restaurante. */
@Component({
  selector: 'app-inicio',
  imports: [Navegacion, Portada, Nosotros, Carta, Contacto, PieDePagina],
  templateUrl: './inicio.html',
})
export class Inicio {}
