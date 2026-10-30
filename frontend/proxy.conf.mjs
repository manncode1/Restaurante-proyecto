// Durante `ng serve`, las peticiones a /backend/... se reenvían al Apache local,
// así el frontend usa la misma ruta relativa que en producción y no hace falta CORS.
//
// Por defecto: Apache en el puerto 8080 con el proyecto en htdocs/restaurante-web.
// Si tu entorno es distinto, define BACKEND_URL antes de arrancar (PowerShell):
//   $env:BACKEND_URL = 'http://localhost/restaurante-web'; npm start
const destino = process.env.BACKEND_URL ?? 'http://localhost:8080/restaurante-web';

export default {
  '/backend': {
    target: destino,
    changeOrigin: true,
  },
};
