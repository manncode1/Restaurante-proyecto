# Restaurante web

Sitio de una sola página para restaurantes (portada, nosotros, menú y contacto), pensado para
venderse a negocios pequeños. Los textos, los datos de contacto y el menú salen de la base de
datos, así que cada cliente se personaliza sin tocar código.

- **Frontend:** Angular 22 + Angular Material (`frontend/`)
- **Backend:** PHP 8.1+ con PDO, sin framework (`backend/`)
- **Base de datos:** MySQL 5.7+ o MariaDB 10.3+ (`database/`)

```
backend/
  api/                Endpoints públicos en JSON: menu.php, configuracion.php, ping.php
  config/             config.php y .env (credenciales, no se sube a git)
  lib/                Funciones comunes de la API
  uploads/            Imágenes subidas (Apache solo sirve imágenes desde aquí)
database/
  migrations/         Esquema y claves de configuración, se ejecutan en orden
  seeds/              Datos de ejemplo, solo para desarrollo
frontend/
  src/app/secciones/  Una carpeta por sección de la página
  src/app/services/   Llamadas a la API
  proxy.conf.mjs      Durante `ng serve` envía /backend/... al Apache local
```

## Puesta en marcha (desarrollo)

Requisitos: XAMPP (Apache con PHP 8.1 o superior), MariaDB o MySQL, y Node.js.

### 1. Proyecto en Apache

El repositorio va en `C:\xampp\htdocs\restaurante-web` y Apache escucha en el puerto **8080**.
El `.htaccess` de la raíz bloquea todo excepto `backend/api` y `backend/uploads`, para que nadie
pueda descargar el `.env` ni los SQL.

### 2. Base de datos

Una sola vez, como root, crea la base y su usuario:

```sql
CREATE DATABASE restaurante CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'restaurante_user'@'localhost' IDENTIFIED BY 'tu_contraseña';
GRANT ALL PRIVILEGES ON restaurante.* TO 'restaurante_user'@'localhost';
```

Después, desde la raíz del proyecto (funciona en PowerShell y en cmd), ejecuta en orden:

```powershell
$mysql = 'C:\Program Files\MariaDB 13.0\bin\mysql.exe'
& $mysql -u restaurante_user -p restaurante -e "source database/migrations/001_schema.sql"
& $mysql -u restaurante_user -p restaurante -e "source database/migrations/002_configuracion.sql"
& $mysql -u restaurante_user -p restaurante -e "source database/seeds/001_datos_demo.sql"
```

Todos los scripts se pueden volver a ejecutar sin duplicar datos.

> Si tu base tiene el esquema anterior (columna `productos.tipo`, sin tabla `categorias`),
> borra las tablas antes de ejecutar los scripts. Solo contenían los datos de ejemplo:
> `DROP TABLE IF EXISTS fotos, productos, categorias, usuarios, configuracion;`

### 3. Configuración del backend

Copia `backend/config/.env.example` como `backend/config/.env` y completa tus datos.
En desarrollo pon `APP_DEBUG=true`. Así ves el detalle de los errores y se habilita `ping.php`.

```powershell
Invoke-RestMethod http://localhost:8080/restaurante-web/backend/api/ping.php
```

### 4. Frontend

```powershell
cd frontend
npm install
npm start
```

Abre http://localhost:4200. El frontend llama a la API con rutas relativas
(`backend/api/menu.php`) y `ng serve` las reenvía a `http://localhost:8080/restaurante-web`.
Si tu Apache usa otro puerto o carpeta, indícalo al arrancar:

```powershell
$env:BACKEND_URL = 'http://localhost/restaurante-web'; npm start
```

## Personalizar el sitio para un cliente

El contenido editable vive en la tabla `configuracion` (clave → valor). Las claves están
definidas en `database/migrations/002_configuracion.sql`. Para un cliente nuevo solo se
cambian los valores; el panel de administración hará esto mismo:

```sql
UPDATE configuracion SET valor = 'La Fonda de Doña Mary' WHERE clave = 'nombre';
```

| Clave | Dónde se usa |
|---|---|
| `nombre`, `eslogan` | Logo, pie de página y título de la pestaña |
| `portada_etiqueta`, `portada_titulo`, `portada_titulo_destacado`, `portada_texto` | Portada (el texto también es la descripción para buscadores) |
| `descripcion`, `frase` | Sección "Nosotros" (respeta los saltos de línea) |
| `direccion`, `maps_url`, `maps_embed` | Dirección, botón "Cómo llegar" y mapa incrustado de Google Maps |
| `horario` | Un renglón por línea |
| `telefono`, `whatsapp`, `correo` | `whatsapp` va solo con dígitos y lada de país: `525512345678` |
| `facebook`, `instagram`, `tiktok` | URL completa del perfil |

- Un valor vacío oculta ese dato. Por ejemplo, sin `tiktok` no aparece el botón de TikTok.
- La tabla es **pública**, porque la lee el sitio: las contraseñas van en el `.env`, nunca ahí.
- El menú sale de `categorias` y `productos`. El `orden` de la categoría define el orden de los
  filtros, y solo se muestran los productos con `disponible = 1`.
- Las fotos (`fotos.ubicacion`) se guardan como ruta relativa: `images/tacos.jpg` o
  `backend/uploads/foto.jpg`.

### Agregar una clave nueva

1. Crea una migración nueva (`database/migrations/003_....sql`) con
   `INSERT IGNORE INTO configuracion (clave, valor) VALUES ('mi_clave', '');`
2. Agrega la propiedad a `Sitio` y a `SITIO_VACIO` en `frontend/src/app/services/configuracion.ts`.
3. Úsala en la sección que corresponda: `{{ sitio().mi_clave }}`.

## Cambios en la base de datos (trabajo en equipo)

- No edites una migración que tu compañero ya ejecutó: crea la siguiente (`003_...`, `004_...`).
  Así cada uno solo aplica lo nuevo.
- Escribe migraciones que se puedan repetir (`CREATE TABLE IF NOT EXISTS`, `INSERT IGNORE`).
- Usa SQL compatible con MySQL **y** MariaDB, porque el hosting del cliente puede tener cualquiera.

## Publicar en un hosting (cPanel)

1. `cd frontend` y luego `npm run build`.
2. Sube el contenido de `frontend/dist/frontend/browser/` a `public_html/`.
3. Sube la carpeta `backend/` completa a `public_html/backend/`, con sus `.htaccess`, que
   bloquean `config/` y `lib/`.
4. Crea la base de datos e importa las migraciones con phpMyAdmin (sin el seed de ejemplo).
5. Crea `public_html/backend/config/.env` con los datos del hosting y `APP_DEBUG=false`.
6. Comprueba que `https://tu-dominio/backend/config/.env` responde **403**.

## Pruebas

```powershell
cd frontend
npm test -- --watch=false
```
