<?php
// Prueba rápida de la API contra un servidor en marcha (necesita los datos de ejemplo).
// Uso: php backend/tests/smoke.php [url-base]
//      php backend/tests/smoke.php http://localhost:8080/restaurante-web
$base = rtrim($argv[1] ?? 'http://localhost:8080/restaurante-web', '/');
$fallos = 0;

/** @return array{0: int, 1: mixed, 2: string} código HTTP, JSON decodificado y cabecera Server */
function pedir(string $url): array {
    $contexto = stream_context_create(['http' => ['ignore_errors' => true, 'timeout' => 10]]);
    $cuerpo = @file_get_contents($url, false, $contexto);
    $cabeceras = $http_response_header ?? [];
    preg_match('~\s(\d{3})\s~', $cabeceras[0] ?? '', $m);
    $servidor = '';
    foreach ($cabeceras as $linea) {
        if (stripos($linea, 'Server:') === 0) {
            $servidor = trim(substr($linea, 7));
        }
    }

    return [(int) ($m[1] ?? 0), $cuerpo === false ? null : json_decode($cuerpo, true), $servidor];
}

function comprobar(bool $ok, string $descripcion): void {
    global $fallos;
    echo ($ok ? '  OK    ' : '  FALLA ') . $descripcion . PHP_EOL;
    $fallos += $ok ? 0 : 1;
}

echo "API en $base" . PHP_EOL;

[$codigo, $menu, $servidor] = pedir("$base/backend/api/menu.php");
comprobar($codigo === 200 && is_array($menu), 'menu.php responde 200 con una lista');
comprobar(count($menu ?? []) === 6, 'el menú de ejemplo tiene 6 platillos');
comprobar(($menu[0]['categoria'] ?? '') === 'Entradas', 'el primer platillo es de la primera categoría');
comprobar(is_float($menu[0]['precio'] ?? null) || is_int($menu[0]['precio'] ?? null), 'el precio es numérico');
[$codigo] = pedir($base . '/' . ($menu[0]['imagen'] ?? 'sin-imagen'));
comprobar($codigo === 200, 'la foto del primer platillo se puede ver (backend/uploads)');

[$codigo, $config] = pedir("$base/backend/api/configuracion.php");
comprobar($codigo === 200 && ($config['nombre'] ?? '') === 'Sabor de Casa', 'configuracion.php devuelve el nombre');
comprobar(array_key_exists('portada_imagen', $config ?? []), 'existen las claves de la portada');

$post = stream_context_create(['http' => ['method' => 'POST', 'ignore_errors' => true]]);
@file_get_contents("$base/backend/api/menu.php", false, $post);
comprobar(str_contains($http_response_header[0] ?? '', '405'), 'POST a menu.php responde 405');

// Los .htaccess solo existen en Apache: con `php -S` (CI) no se pueden comprobar.
if (stripos($servidor, 'apache') !== false) {
    [$codigo] = pedir("$base/backend/config/.env");
    comprobar($codigo === 403, 'el .env está bloqueado (403)');
}

echo $fallos === 0 ? 'Todo bien.' . PHP_EOL : "$fallos comprobaciones fallaron." . PHP_EOL;
exit($fallos === 0 ? 0 : 1);
