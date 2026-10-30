<?php
// Panel: imágenes del sitio (ícono y portada). Se guardan en la BD al momento:
// POST ?clave=icono|portada_imagen (multipart, campo "imagen", cabecera X-Panel: 1)
//   sube la imagen, la deja en `configuracion` y borra la anterior. Responde {"ruta": ...}
// DELETE ?clave=... quita la imagen (valor vacío) y borra el archivo.
require __DIR__ . '/../../lib/admin.php';
require __DIR__ . '/../../lib/configuracion.php';
require __DIR__ . '/../../lib/imagenes.php';

admin_iniciar(['POST', 'DELETE'], archivos: true);

// Tamaño máximo de cada imagen al reducirla.
$claves = ['icono' => 512, 'portada_imagen' => 1600];
$clave = (string) ($_GET['clave'] ?? '');
if (!isset($claves[$clave])) {
    admin_invalido('Imagen no válida.');
}

$anterior = leer_configuracion()[$clave] ?? '';

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $nueva = '';
} else {
    if (empty($_FILES['imagen'])) {
        admin_invalido('No se recibió la imagen. Puede que pese más de lo que permite el servidor.');
    }
    try {
        $nueva = guardar_imagen($_FILES['imagen'], $claves[$clave]);
    } catch (InvalidArgumentException $e) {
        admin_invalido($e->getMessage());
    }
}

db()->prepare('UPDATE configuracion SET valor = ? WHERE clave = ?')->execute([$nueva, $clave]);
if ($anterior !== $nueva) {
    borrar_imagen($anterior);
}

api_responder(['ruta' => $nueva]);
