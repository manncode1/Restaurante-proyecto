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
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'informacion' },
      {
        path: 'informacion',
        loadComponent: () =>
          import('./paginas/admin/informacion/informacion').then((m) => m.Informacion),
      },
      {
        path: 'productos',
        loadComponent: () => import('./paginas/admin/productos/productos').then((m) => m.Productos),
      },
      {
        path: 'categorias',
        loadComponent: () =>
          import('./paginas/admin/categorias/categorias').then((m) => m.Categorias),
      },
      {
        path: 'cuenta',
        loadComponent: () => import('./paginas/admin/cuenta/cuenta').then((m) => m.Cuenta),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
