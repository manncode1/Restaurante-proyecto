<?php
// Funciones comunes de los endpoints del panel (backend/api/admin).
require_once __DIR__ . '/api.php';
require_once __DIR__ . '/sesion.php';

/**
 * Como api_iniciar(), pero exige sesión iniciada (401 si no la hay) y que los POST/PUT
 * lleguen como JSON, o con la cabecera X-Panel si son archivos ($archivos = true).
 * Un formulario de otro sitio no puede enviar ni JSON ni cabeceras propias, así que esto
 * (junto con la cookie SameSite=Lax) evita que otra página haga cambios en nombre del usuario.
 */
function admin_iniciar(array $metodos, bool $archivos = false): string {
    api_iniciar($metodos);

    $usuario = sesion_usuario();
    if ($usuario === null) {
        api_responder(['error' => 'Inicia sesión para continuar.'], 401);
    }

    if (in_array($_SERVER['REQUEST_METHOD'], ['POST', 'PUT'], true)) {
        $valida = $archivos
            ? ($_SERVER['HTTP_X_PANEL'] ?? '') === '1'
            : str_starts_with($_SERVER['CONTENT_TYPE'] ?? '', 'application/json');
        if (!$valida) {
            api_responder(['error' => 'Petición no válida.'], 415);
        }
    }

    return $usuario;
}

/** Responde 422 con un mensaje para mostrar en el formulario. */
function admin_invalido(string $mensaje): never {
    api_responder(['error' => $mensaje], 422);
}

/** Código de error de MySQL de una excepción de PDO (1062 duplicado, 1451/1452 llave foránea). */
function admin_codigo_mysql(PDOException $e): int {
    return (int) ($e->errorInfo[1] ?? 0);
}
