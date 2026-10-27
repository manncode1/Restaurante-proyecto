<?php
require __DIR__ . '/../config/config.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: ' . env('ALLOWED_ORIGIN', 'http://localhost:4200'));

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
    http_response_code(500);
    $res['db'] = ['conectado' => false, 'error' => $e->getMessage()];
}

echo json_encode($res, JSON_PRETTY_PRINT);
