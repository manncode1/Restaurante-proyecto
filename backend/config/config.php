<?php
// Configuración del backend: lee backend/config/.env y abre la conexión a la BD.

/**
 * Valor de una variable del .env (formato CLAVE=valor, una por línea).
 * Las líneas que empiezan con # son comentarios. Los valores pueden ir entre
 * comillas si contienen espacios o caracteres especiales: DB_PASS="a#b;c".
 */
function env(string $key, ?string $default = null): ?string {
    static $vars = null;

    if ($vars === null) {
        $vars = [];
        $file = __DIR__ . '/.env';
        $lineas = is_readable($file) ? file($file, FILE_IGNORE_NEW_LINES) : [];

        foreach ($lineas as $linea) {
            $linea = trim($linea);
            if ($linea === '' || $linea[0] === '#' || !str_contains($linea, '=')) {
                continue;
            }

            [$clave, $valor] = array_map('trim', explode('=', $linea, 2));
            $comilla = $valor[0] ?? '';
            if (strlen($valor) >= 2 && ($comilla === '"' || $comilla === "'") && str_ends_with($valor, $comilla)) {
                $valor = substr($valor, 1, -1);
            }
            $vars[$clave] = $valor;
        }
    }

    return $vars[$key] ?? $default;
}

/** APP_DEBUG=true solo en desarrollo: muestra detalles de errores y habilita api/ping.php. */
function modo_debug(): bool {
    return filter_var(env('APP_DEBUG', 'false'), FILTER_VALIDATE_BOOLEAN);
}

function db(): PDO {
    static $pdo = null;
    if ($pdo === null) {
        $pdo = new PDO(
            'mysql:host=' . env('DB_HOST', 'localhost') . ';port=' . env('DB_PORT', '3306')
                . ';dbname=' . env('DB_NAME', 'restaurante') . ';charset=utf8mb4',
            env('DB_USER', 'root'),
            env('DB_PASS', ''),
            [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
             PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
             PDO::ATTR_EMULATE_PREPARES => false,
             PDO::ATTR_TIMEOUT => 5]   // si la BD no responde, error en 5 s y no una página colgada
        );
    }
    return $pdo;
}
