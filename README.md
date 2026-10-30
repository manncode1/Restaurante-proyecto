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
  lib/                Funciones comunes (API, lectura de configuración, metadatos de la página)
  tests/smoke.php     Prueba rápida de la API
  uploads/            Imágenes subidas (Apache solo sirve imágenes desde aquí)
database/
  migrations/         Esquema y claves de configuración, se ejecutan en orden
  seeds/              Datos de ejemplo, solo para desarrollo
frontend/
  public/             Imágenes, favicon y, para producción, index.php y .htaccess
  src/app/secciones/  Una carpeta por sección de la página
  src/app/services/   Llamadas a la API
  proxy.conf.mjs      Durante `ng serve` envía /backend/... al Apache local
.github/workflows/    CI: build, pruebas, sintaxis PHP y migraciones en MySQL y MariaDB
```

## Puesta en marcha (desarrollo)

Requisitos: XAMPP (Apache con PHP 8.1 o superior y su MariaDB), y Node.js 24 (ver `.nvmrc`).

### 1. Apache en el puerto 8080

El repositorio va en `C:\xampp\htdocs\restaurante-web`. Apache debe escuchar en el **8080**:
en `C:\xampp\apache\conf\httpd.conf` cambia `Listen 80` por `Listen 8080` y
`ServerName localhost:80` por `ServerName localhost:8080`, y reinicia Apache desde el panel de XAMPP.

El `.htaccess` de la raíz bloquea todo excepto `backend/api` y `backend/uploads`, para que nadie
pueda descargar el `.env` ni los SQL.

### 2. Base de datos

Usa **un solo** servidor MySQL/MariaDB en el puerto 3306. Si tienes dos (por ejemplo el de XAMPP
y otro instalado aparte), PHP se conecta a cualquiera de los dos y aparecen errores raros. Si usas
un MariaDB instalado aparte, no arranques el MySQL del panel de XAMPP (o cámbiale el puerto a 3307
en `C:\xampp\mysql\bin\my.ini`).

Una sola vez, como root (phpMyAdmin → pestaña SQL, o la consola), crea la base y su usuario:

```sql
CREATE DATABASE restaurante CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'restaurante_user'@'localhost' IDENTIFIED BY 'tu_contraseña';
GRANT ALL PRIVILEGES ON restaurante.* TO 'restaurante_user'@'localhost';
```

Después, desde la raíz del proyecto en PowerShell, ejecuta los scripts en orden
(`$mysql` según tu instalación):

```powershell
$mysql = 'C:\Program Files\MariaDB 13.0\bin\mysql.exe'   # o 'C:\xampp\mysql\bin\mysql.exe'
& $mysql -u restaurante_user -p restaurante -e "source database/migrations/001_schema.sql"
& $mysql -u restaurante_user -p restaurante -e "source database/migrations/002_configuracion.sql"
& $mysql -u restaurante_user -p restaurante -e "source database/seeds/001_datos_demo.sql"
```

Todos se pueden volver a ejecutar sin duplicar datos.

> Si tu base tiene un esquema anterior (sin la tabla `categorias` o sin `productos.orden`),
> borra las tablas antes de ejecutar los scripts. Solo contenían datos de ejemplo:
> `DROP TABLE IF EXISTS fotos, productos, categorias, usuarios, configuracion;`

### 3. Configuración del backend

Copia `backend/config/.env.example` como `backend/config/.env` y completa tus datos.
En desarrollo pon `APP_DEBUG=true`, que muestra el detalle de los errores y habilita `ping.php`.
Comprueba que todo responde:

```powershell
C:\xampp\php\php.exe backend\tests\smoke.php
```

Crea tu usuario del panel de administración (la contraseña se guarda con `password_hash`):

```powershell
C:\xampp\php\php.exe backend\scripts\crear_usuario.php admin tu-contraseña
```

### 4. Frontend

```powershell
cd frontend
npm install
npm start
```

Abre http://localhost:4200. El panel está en http://localhost:4200/admin (por ahora solo el login
y una página de entrada, sin diseño). El frontend llama a la API con rutas relativas
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
| `nombre`, `eslogan` | Logo, pie de página, título de la pestaña y vista previa al compartir |
| `icono` | Logo cuadrado (PNG o SVG) junto al nombre y favicon. Vacío = la estrella ✦ por defecto |
| `portada_etiqueta`, `portada_titulo`, `portada_titulo_destacado`, `portada_texto` | Portada (el texto también es la descripción para buscadores) |
| `portada_imagen` | Foto de la portada y de la vista previa: `images/portada.jpg` o `backend/uploads/...` |
| `portada_nota_titulo`, `portada_nota_texto` | Recuadro de la esquina de la portada |
| `descripcion`, `frase` | Sección "Nosotros" (respeta los saltos de línea) |
| `direccion`, `maps_url`, `maps_embed` | Dirección, botón "Cómo llegar" y mapa incrustado de Google Maps |
| `horario` | Un renglón por línea |
| `telefono`, `whatsapp`, `correo` | `whatsapp` va solo con dígitos y lada de país: `525512345678` |
| `facebook`, `instagram`, `tiktok` | URL completa del perfil |

- Un valor vacío oculta ese dato. Por ejemplo, sin `tiktok` no aparece el botón de TikTok.
- La tabla es **pública**, porque la lee el sitio: las contraseñas van en el `.env`, nunca ahí.
- El menú sale de `categorias` y `productos`. El `orden` de la categoría define el orden de los
  filtros, el `orden` del producto el de los platillos dentro de su categoría, y solo se muestran
  los productos con `disponible = 1`.
- Las fotos de los platillos van en `backend/uploads/` y `fotos.ubicacion` guarda su ruta relativa
  (`backend/uploads/tacos.jpg`). Git ignora esa carpeta salvo `backend/uploads/demo/`, que tiene
  las fotos de los datos de ejemplo.
- La foto de portada debe ser ligera (unos 300 KB, 1280 px de ancho): es lo primero que se descarga.

### Agregar una clave nueva

1. Crea una migración nueva (`database/migrations/003_....sql`) con
   `INSERT IGNORE INTO configuracion (clave, valor) VALUES ('mi_clave', '');`
2. Agrega la propiedad a `Sitio` y a `SITIO_VACIO` en `frontend/src/app/services/configuracion.ts`.
3. Úsala en la sección que corresponda: `{{ sitio().mi_clave }}`.

## Cambios en la base de datos

- No edites una migración que tu compañero ya ejecutó: crea la siguiente (`003_...`, `004_...`).
  Así cada uno, y cada cliente instalado, solo aplica lo nuevo.
- Escribe migraciones que se puedan repetir (`CREATE TABLE IF NOT EXISTS`, `INSERT IGNORE`).
- `ADD COLUMN IF NOT EXISTS` solo existe en MariaDB y falla en MySQL. Para un `ALTER` repetible,
  usa este patrón:

  ```sql
  SET @falta = (SELECT COUNT(*) = 0 FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'productos' AND COLUMN_NAME = 'nueva');
  SET @sql = IF(@falta, 'ALTER TABLE productos ADD COLUMN nueva INT NOT NULL DEFAULT 0', 'DO 0');
  PREPARE paso FROM @sql; EXECUTE paso; DEALLOCATE PREPARE paso;
  ```

- La CI prueba cada migración dos veces en MySQL 5.7, MySQL 8.0 y MariaDB 10.6.

## Flujo de trabajo con git

- Nada directo a `main`: cada tarea en su rama (`feature/<tema>` o `fix/<tema>`) creada desde
  `main` actualizado, y se integra con un pull request que el otro revisa y que pasa la CI.
- Mensajes de commit con el formato `tipo: descripción` (`feat`, `fix`, `docs`, `style`,
  `refactor`, `chore`).
- Antes de subir cambios del frontend: `npm run format` (la CI rechaza el código sin formato).
- Haz `git pull` antes de empezar a trabajar, sobre todo si van a tocar el mismo archivo.

## Pruebas

```powershell
cd frontend
npm test -- --watch=false                     # pruebas del frontend
C:\xampp\php\php.exe ..\backend\tests\smoke.php   # API contra el Apache local
```

## Publicar en un hosting (cPanel)

1. En cPanel ("Select PHP Version" o "MultiPHP Manager") elige PHP 8.1 o superior con `pdo_mysql`.
2. En "Bases de datos MySQL" crea la base y el usuario (llevan el prefijo de la cuenta) y dale
   todos los privilegios. En phpMyAdmin, con esa base seleccionada, importa `001` y `002` en orden.
   El seed de ejemplo **no** se importa: los datos del cliente se cargan con `UPDATE configuracion`
   y los `INSERT` de categorías y productos (hasta que exista el panel).
3. `cd frontend` y `npm run build`. Sube el contenido de `frontend/dist/frontend/browser/` a
   `public_html/`. Incluye `index.php` y `.htaccess`: `index.php` escribe en el HTML el título,
   la descripción y la vista previa al compartir el enlace, y `.htaccess` agrega la caché, la
   compresión y las rutas para el futuro panel.
4. Sube `backend/` a `public_html/backend/` **sin** `config/.env` y sin el contenido de
   `uploads/`. Al volver a publicar, no sobrescribas el `.env` ni `uploads/` del servidor.
5. Crea `public_html/backend/config/.env` con los datos de la base, `APP_DEBUG=false` y
   `APP_URL=https://dominio-del-cliente`. Por SSH o la Terminal de cPanel, crea el usuario del
   panel: `php backend/scripts/crear_usuario.php admin contraseña-segura`.
6. Comprueba:
   - `https://dominio/backend/config/.env` responde **403**.
   - `https://dominio/backend/api/menu.php` devuelve el menú.
   - `https://dominio/backend/api/ping.php` responde 404 (por `APP_DEBUG=false`).
   - Al pegar el enlace en WhatsApp aparece el nombre y la foto.

Para publicar en una subcarpeta (`dominio.com/restaurante/`), compila desde **PowerShell** con
`npm run build -- --base-href /restaurante/`. En Git Bash la ruta `/restaurante/` se convierte
sola en una ruta de Windows y la página queda en blanco.
