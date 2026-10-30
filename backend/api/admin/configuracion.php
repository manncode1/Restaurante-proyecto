<?php
// Panel: datos del sitio (tabla configuracion).
// GET devuelve todas las claves; PUT {"valores": {"clave": "valor", ...}} guarda los valores.
// Solo se actualizan claves que ya existen: las claves las definen las migraciones.
// Las imágenes (icono, portada_imagen) no se cambian aquí sino en imagen-sitio.php,
// que las guarda al momento de subirlas.
require __DIR__ . '/../../lib/admin.php';
require __DIR__ . '/../../lib/configuracion.php';

const CLAVES_IMAGEN = ['icono', 'portada_imagen'];

admin_iniciar(['GET', 'PUT']);

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    api_responder((object) leer_configuracion());
}

$valores = api_entrada()['valores'] ?? null;
if (!is_array($valores)) {
    admin_invalido('Faltan los valores a guardar.');
}

$existentes = leer_configuracion();
$actualizar = db()->prepare('UPDATE configuracion SET valor = ? WHERE clave = ?');

db()->beginTransaction();
foreach ($valores as $clave => $valor) {
    if (array_key_exists($clave, $existentes) && !in_array($clave, CLAVES_IMAGEN, true) && is_scalar($valor)) {
        $actualizar->execute([trim((string) $valor), $clave]);
    }
}
db()->commit();

api_responder((object) leer_configuracion());
