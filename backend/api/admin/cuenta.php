<?php
// Panel: cuenta del usuario con sesión iniciada.
// GET {usuario} | PUT {password_actual, usuario?, password_nueva?}
// Cualquier cambio exige la contraseña actual.
require __DIR__ . '/../../lib/admin.php';

$usuario = admin_iniciar(['GET', 'PUT']);

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    api_responder(['usuario' => $usuario]);
}

$datos = api_entrada();
$actual = (string) ($datos['password_actual'] ?? '');
$nuevoUsuario = trim((string) ($datos['usuario'] ?? $usuario));
$nuevaPassword = (string) ($datos['password_nueva'] ?? '');

$consulta = db()->prepare('SELECT id, password_hash FROM usuarios WHERE usuario = ?');
$consulta->execute([$usuario]);
$cuenta = $consulta->fetch();

if (!$cuenta || !password_verify($actual, $cuenta['password_hash'])) {
    admin_invalido('La contraseña actual no es correcta.');
}
if ($nuevoUsuario === '' || mb_strlen($nuevoUsuario) > 60) {
    admin_invalido('El usuario es obligatorio y puede tener hasta 60 caracteres.');
}
if ($nuevaPassword !== '' && strlen($nuevaPassword) < 8) {
    admin_invalido('La contraseña nueva debe tener al menos 8 caracteres.');
}

$hash = $nuevaPassword !== '' ? password_hash($nuevaPassword, PASSWORD_DEFAULT) : $cuenta['password_hash'];

try {
    db()->prepare('UPDATE usuarios SET usuario = ?, password_hash = ? WHERE id = ?')
        ->execute([$nuevoUsuario, $hash, $cuenta['id']]);
} catch (PDOException $e) {
    if (admin_codigo_mysql($e) === 1062) {
        api_responder(['error' => 'Ese nombre de usuario ya existe.'], 409);
    }
    throw $e;
}

// La sesión sigue abierta con el nombre nuevo (y un id de sesión nuevo).
session_regenerate_id(true);
$_SESSION['usuario'] = $nuevoUsuario;

api_responder(['usuario' => $nuevoUsuario]);
