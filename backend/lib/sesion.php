<?php
// Sesión del panel de administración (cookie de PHP, solo accesible desde el servidor).

function sesion_iniciar(): void {
    if (session_status() === PHP_SESSION_ACTIVE) {
        return;
    }
    session_name('restaurante_admin');
    session_set_cookie_params([
        'path' => '/',
        'httponly' => true,
        'samesite' => 'Lax',
        'secure' => ($_SERVER['HTTPS'] ?? 'off') !== 'off',
    ]);
    session_start();
}

/** Usuario con sesión iniciada, o null. */
function sesion_usuario(): ?string {
    sesion_iniciar();
    return $_SESSION['usuario'] ?? null;
}
