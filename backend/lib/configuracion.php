<?php
require_once __DIR__ . '/../config/config.php';

/** Configuración pública del sitio: ['clave' => 'valor', ...] desde la tabla `configuracion`. */
function leer_configuracion(): array {
    $valores = db()->query('SELECT clave, valor FROM configuracion')->fetchAll(PDO::FETCH_KEY_PAIR);

    return array_map(fn ($valor) => (string) $valor, $valores);
}
