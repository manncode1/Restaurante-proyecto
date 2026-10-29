import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Meta, Title } from '@angular/platform-browser';
import { Observable, catchError, of, tap } from 'rxjs';

/**
 * Datos editables del sitio: una propiedad por cada clave de la tabla `configuracion`
 * (ver database/migrations/002_configuracion.sql). Un valor vacío oculta ese dato.
 */
export interface Sitio {
  nombre: string;
  eslogan: string;
  portada_etiqueta: string;
  portada_titulo: string;
  portada_titulo_destacado: string;
  portada_texto: string;
  descripcion: string;
  frase: string;
  direccion: string;
  maps_url: string;
  maps_embed: string;
  horario: string;
  telefono: string;
  whatsapp: string;
  correo: string;
  facebook: string;
  instagram: string;
  tiktok: string;
}

const SITIO_VACIO: Sitio = {
  nombre: '',
  eslogan: '',
  portada_etiqueta: '',
  portada_titulo: '',
  portada_titulo_destacado: '',
  portada_texto: '',
  descripcion: '',
  frase: '',
  direccion: '',
  maps_url: '',
  maps_embed: '',
  horario: '',
  telefono: '',
  whatsapp: '',
  correo: '',
  facebook: '',
  instagram: '',
  tiktok: '',
};

@Injectable({
  providedIn: 'root'
})
export class Configuracion {
  private http = inject(HttpClient);
  private titulo = inject(Title);
  private meta = inject(Meta);

  private apiUrl = 'backend/api/configuracion.php';
  private datos = signal<Sitio>(SITIO_VACIO);

  /** Configuración actual del sitio. */
  readonly sitio = this.datos.asReadonly();

  /**
   * Descarga la configuración. Se ejecuta una sola vez al arrancar la app
   * (provideAppInitializer en app.config.ts); si falla, el sitio sigue con valores vacíos.
   */
  cargar(): Observable<unknown> {
    return this.http.get<Partial<Sitio>>(this.apiUrl).pipe(
      tap((valores) => this.aplicar({ ...SITIO_VACIO, ...valores })),
      catchError((error) => {
        console.error('No se pudo cargar la configuración del sitio:', error);
        return of(null);
      }),
    );
  }

  private aplicar(sitio: Sitio): void {
    this.datos.set(sitio);

    if (sitio.nombre) {
      this.titulo.setTitle(sitio.eslogan ? `${sitio.nombre} | ${sitio.eslogan}` : sitio.nombre);
    }
    this.meta.updateTag({ name: 'description', content: sitio.portada_texto });
  }
}
