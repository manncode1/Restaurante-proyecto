<?php
// Configuración pública del sitio: { "clave": "valor", ... } desde la tabla `configuracion`.
// Todo lo que hay en esa tabla es visible para cualquiera; los secretos van en el .env.
require __DIR__ . '/../lib/api.php';

api_iniciar(['GET']);

$valores = db()->query('SELECT clave, valor FROM configuracion')->fetchAll(PDO::FETCH_KEY_PAIR);

// (object) para que una tabla vacía se envíe como {} y no como [].
api_responder((object) array_map(fn ($valor) => (string) $valor, $valores));
