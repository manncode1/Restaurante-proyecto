import { Component, inject, input, model, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { Admin, ImagenSitio, mensajeError } from '../../../services/admin';

/**
 * Campo de imagen del panel: vista previa, botón para elegir archivo y "Quitar".
 *
 * - Con `clave` (ícono o portada): la imagen se guarda en la BD en cuanto se sube,
 *   y "Quitar" la borra. Uso: <app-campo-imagen clave="icono" [(ruta)]="valores['icono']" />
 * - Sin `clave` (foto de producto): la ruta se guarda después junto con el formulario.
 *   Si se reemplaza o se quita antes de guardar, el archivo que ya no se usará se descarta.
 */
@Component({
  selector: 'app-campo-imagen',
  templateUrl: './campo-imagen.html',
})
export class CampoImagen {
  private readonly admin = inject(Admin);

  readonly ruta = model('');
  readonly clave = input<ImagenSitio | null>(null);
  readonly etiqueta = input('Imagen');

  protected readonly subiendo = signal(false);
  protected readonly mensaje = signal('');
  protected readonly error = signal('');

  /** Subidas de este campo que aún no se guardan con el formulario. */
  private readonly pendientes = new Set<string>();

  protected subir(evento: Event): void {
    const campo = evento.target as HTMLInputElement;
    const archivo = campo.files?.[0];
    if (!archivo) {
      return;
    }

    const clave = this.clave();
    this.ejecutar(
      clave ? this.admin.subirImagenSitio(clave, archivo) : this.admin.subirImagen(archivo),
      ({ ruta }) => {
        if (!clave) {
          this.descartarPendiente();
          this.pendientes.add(ruta);
        }
        this.ruta.set(ruta);
        this.mensaje.set(clave ? 'Imagen guardada.' : '');
      },
      () => (campo.value = ''),
    );
  }

  protected quitar(): void {
    const clave = this.clave();
    if (clave) {
      this.ejecutar(this.admin.quitarImagenSitio(clave), () => {
        this.ruta.set('');
        this.mensaje.set('Imagen quitada.');
      });
    } else {
      this.descartarPendiente();
      this.ruta.set('');
    }
  }

  private descartarPendiente(): void {
    const actual = this.ruta();
    if (this.pendientes.delete(actual)) {
      this.admin.descartarImagen(actual).subscribe();
    }
  }

  private ejecutar<T>(
    peticion: Observable<T>,
    alTerminar: (respuesta: T) => void,
    siempre = () => {},
  ): void {
    this.error.set('');
    this.mensaje.set('');
    this.subiendo.set(true);
    peticion.subscribe({
      next: alTerminar,
      error: (e) => {
        this.error.set(mensajeError(e));
        this.subiendo.set(false);
        siempre();
      },
      complete: () => {
        this.subiendo.set(false);
        siempre();
      },
    });
  }
}
