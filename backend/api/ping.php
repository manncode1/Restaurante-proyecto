<?php
// Diagnóstico del entorno. Solo responde con APP_DEBUG=true; en producción da 404.
require __DIR__ . '/../lib/api.php';

api_iniciar(['GET']);

if (!modo_debug()) {
    api_responder(['error' => 'No encontrado.'], 404);
}

$res = [
    'apache_php'  => PHP_VERSION,
    'env_cargado' => file_exists(__DIR__ . '/../config/.env'),
    'pdo_mysql'   => extension_loaded('pdo_mysql'),
    'db'          => null,
];

try {
    $row = db()->query('SELECT DATABASE() AS bd, VERSION() AS version')->fetch();
    $res['db'] = ['conectado' => true, 'bd' => $row['bd'], 'version' => $row['version']];
} catch (Throwable $e) {
    $res['db'] = ['conectado' => false, 'error' => $e->getMessage()];
    api_responder($res, 500);
}

api_responder($res);
