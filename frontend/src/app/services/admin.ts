import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Categoria {
  id: number;
  nombre: string;
  orden: number;
  /** Cuántos productos tiene (no se puede borrar si tiene). */
  productos: number;
}

export interface Producto {
  id: number;
  categoria_id: number;
  categoria: string;
  nombre: string;
  descripcion: string;
  precio: number;
  disponible: boolean;
  /** Ruta de la foto (backend/uploads/...) o '' si no tiene. */
  imagen: string;
}

/** Imágenes del sitio que se guardan al momento de subirlas. */
export type ImagenSitio = 'icono' | 'portada_imagen';

/** Datos que se envían al crear o editar (sin id = crear). */
export type CategoriaForm = Pick<Categoria, 'nombre'> & { id?: number };
export type ProductoForm = Omit<Producto, 'id' | 'categoria'> & { id?: number };

/** API del panel de administración (backend/api/admin, requiere sesión). */
@Injectable({
  providedIn: 'root',
})
export class Admin {
  private http = inject(HttpClient);
  private apiUrl = 'backend/api/admin';

  configuracion(): Observable<Record<string, string>> {
    return this.http.get<Record<string, string>>(`${this.apiUrl}/configuracion.php`);
  }

  guardarConfiguracion(valores: Record<string, string>): Observable<Record<string, string>> {
    return this.http.put<Record<string, string>>(`${this.apiUrl}/configuracion.php`, {
      valores,
    });
  }

  /** Sube la foto de un producto; su ruta se guarda después junto con el producto. */
  subirImagen(archivo: File): Observable<{ ruta: string }> {
    return this.enviarArchivo(`${this.apiUrl}/subir.php`, archivo);
  }

  /** Descarta una foto subida que al final no se usó (si está en uso, el servidor no la borra). */
  descartarImagen(ruta: string): Observable<unknown> {
    return this.http.delete(`${this.apiUrl}/subir.php`, {
      params: { ruta },
      headers: { 'X-Panel': '1' },
    });
  }

  /** Sube el ícono o la portada y lo guarda en la BD en ese momento. */
  subirImagenSitio(clave: ImagenSitio, archivo: File): Observable<{ ruta: string }> {
    return this.enviarArchivo(`${this.apiUrl}/imagen-sitio.php?clave=${clave}`, archivo);
  }

  /** Quita el ícono o la portada (y borra el archivo). */
  quitarImagenSitio(clave: ImagenSitio): Observable<{ ruta: string }> {
    return this.http.delete<{ ruta: string }>(`${this.apiUrl}/imagen-sitio.php`, {
      params: { clave },
      headers: { 'X-Panel': '1' },
    });
  }

  usuarioActual(): Observable<{ usuario: string }> {
    return this.http.get<{ usuario: string }>(`${this.apiUrl}/cuenta.php`);
  }

  /** Exige la contraseña actual. password_nueva vacía = no cambiarla. */
  guardarCuenta(datos: {
    password_actual: string;
    usuario: string;
    password_nueva: string;
  }): Observable<{ usuario: string }> {
    return this.http.put<{ usuario: string }>(`${this.apiUrl}/cuenta.php`, datos);
  }

  categorias(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(`${this.apiUrl}/categorias.php`);
  }

  guardarCategoria(categoria: CategoriaForm): Observable<unknown> {
    return this.guardar('categorias', categoria);
  }

  /** Guarda el orden de las categorías: los ids en el orden en que deben aparecer. */
  ordenarCategorias(ids: number[]): Observable<unknown> {
    return this.http.put(`${this.apiUrl}/categorias.php`, { ordenar: ids });
  }

  borrarCategoria(id: number): Observable<unknown> {
    return this.http.delete(`${this.apiUrl}/categorias.php`, { params: { id } });
  }

  productos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.apiUrl}/productos.php`);
  }

  guardarProducto(producto: ProductoForm): Observable<unknown> {
    return this.guardar('productos', producto);
  }

  borrarProducto(id: number): Observable<unknown> {
    return this.http.delete(`${this.apiUrl}/productos.php`, { params: { id } });
  }

  private enviarArchivo(url: string, archivo: File): Observable<{ ruta: string }> {
    const datos = new FormData();
    datos.append('imagen', archivo);
    return this.http.post<{ ruta: string }>(url, datos, { headers: { 'X-Panel': '1' } });
  }

  private guardar(recurso: string, datos: { id?: number }): Observable<unknown> {
    const url = `${this.apiUrl}/${recurso}.php`;
    return datos.id ? this.http.put(url, datos) : this.http.post(url, datos);
  }
}

/** Mensaje para mostrar a partir de un error de la API. */
export function mensajeError(error: unknown): string {
  if (error instanceof HttpErrorResponse && typeof error.error?.error === 'string') {
    return error.error.error;
  }
  return 'Ocurrió un error. Intenta de nuevo.';
}
