<?php
// Panel: imágenes de productos.
// POST (multipart, campo "imagen", cabecera X-Panel: 1) sube una imagen y responde
//   {"ruta": "backend/uploads/..."}; la ruta se guarda después junto con el producto.
// DELETE ?ruta= descarta una imagen subida que al final no se usó (formulario cancelado
//   o foto cambiada antes de guardar). Si algún producto o dato del sitio la usa, no se borra.
require __DIR__ . '/../../lib/admin.php';
require __DIR__ . '/../../lib/imagenes.php';

admin_iniciar(['POST', 'DELETE'], archivos: true);

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $ruta = (string) ($_GET['ruta'] ?? '');
    if (ruta_imagen_valida($ruta) && !imagen_en_uso($ruta)) {
        borrar_imagen($ruta);
    }
    api_responder(['ok' => true]);
}

if (empty($_FILES['imagen'])) {
    admin_invalido('No se recibió la imagen. Puede que pese más de lo que permite el servidor.');
}

try {
    api_responder(['ruta' => guardar_imagen($_FILES['imagen'], 1200)], 201);
} catch (InvalidArgumentException $e) {
    admin_invalido($e->getMessage());
}
