<?php
// Cierra la sesión del panel.
require __DIR__ . '/../lib/api.php';
require __DIR__ . '/../lib/sesion.php';

api_iniciar(['POST']);

sesion_iniciar();
$_SESSION = [];
session_destroy();
setcookie(session_name(), '', ['expires' => 1, 'path' => '/']);

api_responder(['usuario' => null]);
