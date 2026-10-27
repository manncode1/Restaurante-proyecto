<?php
function env(string $key, ?string $default = null): ?string {
    static $vars = null;
    if ($vars === null) {
        $file = __DIR__ . '/.env';
        $vars = file_exists($file) ? parse_ini_file($file) : [];
    }
    return $vars[$key] ?? $default;
}

function db(): PDO {
    static $pdo = null;
    if ($pdo === null) {
        $pdo = new PDO(
            'mysql:host=' . env('DB_HOST', 'localhost') . ';dbname=' . env('DB_NAME') . ';charset=utf8mb4',
            env('DB_USER', 'root'),
            env('DB_PASS', ''),
            [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
             PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]
        );
    }
    return $pdo;
}
