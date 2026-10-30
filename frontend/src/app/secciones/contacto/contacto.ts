import { Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { DomSanitizer } from '@angular/platform-browser';
import { Configuracion } from '../../services/configuracion';
import { irASeccion } from '../../shared/navegacion';

// Para agregar otra red: crea su clave en la BD (nueva migración) y añádela aquí y en `Sitio`.
const REDES_SOCIALES = [
  { clave: 'facebook', nombre: 'Facebook' },
  { clave: 'instagram', nombre: 'Instagram' },
  { clave: 'tiktok', nombre: 'TikTok' },
] as const;

// Solo se incrustan mapas de Google, aunque en la BD se pegue otra cosa.
const URL_MAPA_PERMITIDA = /^https:\/\/((www\.)?google\.com\/maps|maps\.google\.com\/)/;

@Component({
  selector: 'app-contacto',
  imports: [MatButtonModule],
  templateUrl: './contacto.html',
  styleUrl: './contacto.scss',
})
export class Contacto {
  private readonly sanitizer = inject(DomSanitizer);

  protected readonly sitio = inject(Configuracion).sitio;
  protected readonly irASeccion = irASeccion;

  protected readonly telefonoUrl = computed(
    () => 'tel:' + this.sitio().telefono.replace(/[^\d+]/g, ''),
  );

  protected readonly whatsappUrl = computed(
    () => 'https://wa.me/' + this.sitio().whatsapp.replace(/\D/g, ''),
  );

  protected readonly redes = computed(() =>
    REDES_SOCIALES.map((red) => ({ nombre: red.nombre, url: this.sitio()[red.clave] })).filter(
      (red) => red.url,
    ),
  );

  /** Acepta la URL del mapa o el código <iframe> completo que da Google Maps. */
  protected readonly mapa = computed(() => {
    const valor = this.sitio().maps_embed.trim();
    const url = (valor.match(/src="([^"]+)"/)?.[1] ?? valor).replace(/&amp;/g, '&');

    return URL_MAPA_PERMITIDA.test(url) ? this.sanitizer.bypassSecurityTrustResourceUrl(url) : null;
  });
}
