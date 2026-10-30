import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Admin, ImagenSitio, mensajeError } from '../../../services/admin';
import { DIAS, DiaClave, HORAS, leerHorario } from '../../../shared/horario';
import { CampoImagen } from '../campo-imagen/campo-imagen';

interface Campo {
  clave: string;
  etiqueta: string;
  /** texto (una línea, por defecto), parrafo (varias líneas) */
  tipo?: 'texto' | 'parrafo';
  ayuda?: string;
}

/** Imágenes del sitio: van fuera del formulario porque se guardan al momento de subirlas. */
const IMAGENES: { clave: ImagenSitio; etiqueta: string; ayuda: string }[] = [
  {
    clave: 'icono',
    etiqueta: 'Ícono o logo',
    ayuda: 'Imagen cuadrada; también es el ícono de la pestaña. Sin imagen se usa la estrella.',
  },
  {
    clave: 'portada_imagen',
    etiqueta: 'Imagen de portada',
    ayuda: 'Horizontal y de buena calidad: es lo primero que se ve.',
  },
];

/** Apartados del formulario. Las claves que no estén aquí aparecen en "Otros datos". */
const APARTADOS: { titulo: string; campos: Campo[] }[] = [
  {
    titulo: 'General',
    campos: [
      { clave: 'nombre', etiqueta: 'Nombre del restaurante' },
      { clave: 'eslogan', etiqueta: 'Eslogan' },
    ],
  },
  {
    titulo: 'Portada',
    campos: [
      { clave: 'portada_etiqueta', etiqueta: 'Texto pequeño sobre el título' },
      { clave: 'portada_titulo', etiqueta: 'Título' },
      { clave: 'portada_titulo_destacado', etiqueta: 'Segunda línea del título' },
      { clave: 'portada_texto', etiqueta: 'Texto bajo el título', tipo: 'parrafo' },
      {
        clave: 'portada_nota_titulo',
        etiqueta: 'Recuadro: título',
        ayuda: 'Vacío = no se muestra.',
      },
      { clave: 'portada_nota_texto', etiqueta: 'Recuadro: texto' },
    ],
  },
  {
    titulo: 'Nosotros',
    campos: [
      { clave: 'descripcion', etiqueta: 'Historia del restaurante', tipo: 'parrafo' },
      { clave: 'frase', etiqueta: 'Frase destacada' },
    ],
  },
  {
    titulo: 'Contacto',
    campos: [
      { clave: 'direccion', etiqueta: 'Dirección' },
      { clave: 'telefono', etiqueta: 'Teléfono' },
      {
        clave: 'whatsapp',
        etiqueta: 'WhatsApp',
        ayuda: 'Solo dígitos con lada de país: 525512345678',
      },
      { clave: 'correo', etiqueta: 'Correo' },
      { clave: 'maps_url', etiqueta: 'Enlace "Cómo llegar" (Google Maps)' },
      {
        clave: 'maps_embed',
        etiqueta: 'Mapa incrustado (Google Maps > Compartir > Insertar)',
        tipo: 'parrafo',
      },
    ],
  },
  {
    titulo: 'Redes sociales',
    campos: [
      { clave: 'facebook', etiqueta: 'Facebook (URL completa)' },
      { clave: 'instagram', etiqueta: 'Instagram (URL completa)' },
      { clave: 'tiktok', etiqueta: 'TikTok (URL completa)' },
    ],
  },
];

const CLAVES_CONOCIDAS = new Set<string>([
  'horario',
  ...IMAGENES.map((imagen) => imagen.clave),
  ...APARTADOS.flatMap((a) => a.campos.map((c) => c.clave)),
]);

interface DiaEditable {
  abierto: boolean;
  abre: string;
  cierra: string;
}

// Sin diseño a propósito: solo la funcionalidad.
@Component({
  selector: 'app-informacion',
  imports: [FormsModule, CampoImagen],
  templateUrl: './informacion.html',
})
export class Informacion {
  private readonly admin = inject(Admin);

  protected readonly imagenes = IMAGENES;
  protected readonly apartados = APARTADOS;
  protected readonly dias = DIAS;
  protected readonly horas = HORAS;

  protected valores: Record<string, string> = {};
  protected horario = {} as Record<DiaClave, DiaEditable>;
  protected otros: Campo[] = [];

  protected readonly cargado = signal(false);
  protected readonly guardando = signal(false);
  protected readonly mensaje = signal('');
  protected readonly error = signal('');

  constructor() {
    this.admin.configuracion().subscribe({
      next: (valores) => this.mostrar(valores),
      error: (e) => this.error.set(mensajeError(e)),
    });
  }

  protected guardar(evento: Event): void {
    evento.preventDefault();
    this.guardando.set(true);
    this.mensaje.set('');
    this.error.set('');

    // Las imágenes no viajan con el formulario: ya se guardaron al subirlas.
    const valores: Record<string, string> = { ...this.valores, horario: this.horarioJson() };
    for (const { clave } of IMAGENES) {
      delete valores[clave];
    }
    this.admin.guardarConfiguracion(valores).subscribe({
      next: (guardados) => {
        this.mostrar(guardados);
        this.guardando.set(false);
        this.mensaje.set('Cambios guardados. Se ven en el sitio al recargar la página.');
      },
      error: (e) => {
        this.guardando.set(false);
        this.error.set(mensajeError(e));
      },
    });
  }

  private mostrar(valores: Record<string, string>): void {
    this.valores = { ...valores };
    this.otros = Object.keys(valores)
      .filter((clave) => !CLAVES_CONOCIDAS.has(clave))
      .map((clave) => ({ clave, etiqueta: clave }));

    const guardado = leerHorario(valores['horario'] ?? '');
    for (const { clave } of DIAS) {
      const rango = guardado?.[clave];
      this.horario[clave] = rango
        ? { abierto: true, abre: rango.abre, cierra: rango.cierra }
        : { abierto: false, abre: '09:00', cierra: '22:00' };
    }
    this.cargado.set(true);
  }

  private horarioJson(): string {
    const horario: Record<string, { abre: string; cierra: string } | null> = {};
    for (const { clave } of DIAS) {
      const dia = this.horario[clave];
      horario[clave] = dia.abierto ? { abre: dia.abre, cierra: dia.cierra } : null;
    }
    return JSON.stringify(horario);
  }
}
