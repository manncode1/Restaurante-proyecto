<?php
// Configuración pública del sitio: { "clave": "valor", ... } desde la tabla `configuracion`.
// Todo lo que hay en esa tabla es visible para cualquiera; los secretos van en el .env.
require __DIR__ . '/../lib/api.php';
require __DIR__ . '/../lib/configuracion.php';

api_iniciar(['GET']);

// (object) para que una tabla vacía se envíe como {} y no como [].
api_responder((object) leer_configuracion());
