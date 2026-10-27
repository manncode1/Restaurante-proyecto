<?php
require __DIR__ . '/../config/config.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: ' . env('ALLOWED_ORIGIN', 'http://localhost:4200'));

try {
    $total = db()->query('SELECT COUNT(*) AS n FROM productos')->fetch()['n'];
    echo json_encode(['ok' => true, 'php' => PHP_VERSION, 'productos' => (int)$total]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => $e->getMessage()]);
}
