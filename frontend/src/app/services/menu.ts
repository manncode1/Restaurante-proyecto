import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Platillo {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: string;
  /** Ruta relativa al sitio (images/..., backend/uploads/...) o null si no tiene foto. */
  imagen: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class Menu {
  private http = inject(HttpClient);

  // Ruta relativa: en desarrollo la atiende el proxy de ng serve (proxy.conf.mjs)
  // y en producción la carpeta backend/ que va junto al index.html.
  private apiUrl = 'backend/api/menu.php';

  obtenerPlatillos(): Observable<Platillo[]> {
    return this.http.get<Platillo[]>(this.apiUrl);
  }
}
