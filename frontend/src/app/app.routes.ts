import { Routes } from '@angular/router';
import { sesionRequerida } from './paginas/admin/sesion-requerida';
import { Inicio } from './paginas/inicio/inicio';

export const routes: Routes = [
  { path: '', component: Inicio },
  // El panel se carga aparte (lazy): los visitantes del sitio no descargan su código.
  {
    path: 'admin',
    loadComponent: () => import('./paginas/admin/login/login').then((m) => m.Login),
  },
  {
    path: 'admin/menu',
    canActivate: [sesionRequerida],
    loadComponent: () => import('./paginas/admin/panel/panel').then((m) => m.Panel),
  },
  { path: '**', redirectTo: '' },
];
