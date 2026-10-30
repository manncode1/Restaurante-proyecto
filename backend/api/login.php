<?php
// Inicia sesión en el panel: POST {"usuario": "...", "password": "..."}.
require __DIR__ . '/../lib/api.php';
require __DIR__ . '/../lib/sesion.php';

api_iniciar(['POST']);

$entrada = api_entrada();
$usuario = trim((string) ($entrada['usuario'] ?? ''));
$password = (string) ($entrada['password'] ?? '');

$consulta = db()->prepare('SELECT usuario, password_hash FROM usuarios WHERE usuario = ?');
$consulta->execute([$usuario]);
$fila = $consulta->fetch();

if (!$fila || !password_verify($password, $fila['password_hash'])) {
    // Mismo mensaje si no existe el usuario o la contraseña es incorrecta.
    api_responder(['error' => 'Usuario o contraseña incorrectos.'], 401);
}

sesion_iniciar();
session_regenerate_id(true);
$_SESSION['usuario'] = $fila['usuario'];

api_responder(['usuario' => $fila['usuario']]);
