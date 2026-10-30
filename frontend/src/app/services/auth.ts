import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

interface RespuestaSesion {
  usuario: string | null;
}

/** Sesión del panel de administración (cookie de PHP; ver backend/api/login.php). */
@Injectable({
  providedIn: 'root',
})
export class Auth {
  private http = inject(HttpClient);
  private apiUrl = 'backend/api';

  /** Lanza un error HTTP 401 si el usuario o la contraseña no coinciden. */
  login(usuario: string, password: string): Observable<string> {
    return this.http
      .post<RespuestaSesion>(`${this.apiUrl}/login.php`, { usuario, password })
      .pipe(map((respuesta) => respuesta.usuario ?? ''));
  }

  /** Usuario con sesión iniciada, o null. */
  usuarioActual(): Observable<string | null> {
    return this.http
      .get<RespuestaSesion>(`${this.apiUrl}/sesion.php`)
      .pipe(map((respuesta) => respuesta.usuario));
  }

  logout(): Observable<unknown> {
    return this.http.post(`${this.apiUrl}/logout.php`, {});
  }
}
