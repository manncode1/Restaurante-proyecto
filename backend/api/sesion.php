<?php
// ¿Hay sesión iniciada en el panel? { "usuario": "..." } o { "usuario": null }.
require __DIR__ . '/../lib/api.php';
require __DIR__ . '/../lib/sesion.php';

api_iniciar(['GET']);

api_responder(['usuario' => sesion_usuario()]);
