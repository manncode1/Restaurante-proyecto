<?php
// Funciones comunes de los endpoints de backend/api.
require_once __DIR__ . '/../config/config.php';

/**
 * Prepara la respuesta JSON y valida el método HTTP.
 * Cualquier excepción no capturada en el endpoint termina como un 500 en JSON
 * (con el detalle solo si APP_DEBUG=true; siempre queda en el log de PHP/Apache).
 */
function api_iniciar(array $metodos = ['GET']): void {
    ini_set('display_errors', '0');
    header('Content-Type: application/json; charset=utf-8');
    header('X-Content-Type-Options: nosniff');

    set_exception_handler(function (Throwable $e): void {
        error_log($e->getMessage() . ' en ' . $e->getFile() . ':' . $e->getLine());

        $respuesta = ['error' => 'Error interno del servidor.'];
        if (modo_debug()) {
            $respuesta['detalle'] = $e->getMessage();
        }
        api_responder($respuesta, 500);
    });

    // CORS solo hace falta si el frontend vive en otro dominio. En desarrollo
    // (proxy de ng serve) y en producción (mismo dominio) se deja vacío.
    $origen = env('ALLOWED_ORIGIN');
    if ($origen) {
        header('Access-Control-Allow-Origin: ' . $origen);
        header('Access-Control-Allow-Methods: ' . implode(', ', [...$metodos, 'OPTIONS']));
        header('Access-Control-Allow-Headers: Content-Type');
    }

    $metodo = $_SERVER['REQUEST_METHOD'] ?? 'GET';
    if ($metodo === 'OPTIONS') {
        http_response_code(204);
        exit;
    }
    if (!in_array($metodo, $metodos, true)) {
        header('Allow: ' . implode(', ', $metodos));
        api_responder(['error' => 'Método no permitido.'], 405);
    }
}

/** Cuerpo JSON de la petición como arreglo (vacío si no es JSON válido). */
function api_entrada(): array {
    $datos = json_decode(file_get_contents('php://input') ?: '', true);
    return is_array($datos) ? $datos : [];
}

function api_responder(mixed $datos, int $codigo = 200): never {
    http_response_code($codigo);
    echo json_encode(
        $datos,
        JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_INVALID_UTF8_SUBSTITUTE
    );
    exit;
}
