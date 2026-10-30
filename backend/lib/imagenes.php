<?php
// Imágenes que sube el panel a backend/uploads.

/** Formatos aceptados (se detectan por el contenido del archivo, no por su nombre). SVG no: puede llevar código. */
const IMAGEN_FORMATOS = [
    IMAGETYPE_JPEG => 'jpg',
    IMAGETYPE_PNG => 'png',
    IMAGETYPE_WEBP => 'webp',
    IMAGETYPE_GIF => 'gif',
];
const IMAGEN_PESO_MAXIMO = 5 * 1024 * 1024;

function carpeta_uploads(): string {
    return dirname(__DIR__) . '/uploads';
}

/**
 * Guarda una imagen recibida en $_FILES con un nombre aleatorio y devuelve su ruta
 * relativa al sitio (backend/uploads/xxxx.jpg). Si el servidor tiene GD, la reduce a
 * $ladoMaximo píxeles y le quita los metadatos (GPS de las fotos de celular, etc.).
 * Lanza InvalidArgumentException con un mensaje para mostrar al usuario.
 */
function guardar_imagen(array $archivo, int $ladoMaximo): string {
    $error = $archivo['error'] ?? UPLOAD_ERR_NO_FILE;
    if (in_array($error, [UPLOAD_ERR_INI_SIZE, UPLOAD_ERR_FORM_SIZE], true) || ($archivo['size'] ?? 0) > IMAGEN_PESO_MAXIMO) {
        throw new InvalidArgumentException('La imagen pesa demasiado (máximo 5 MB).');
    }
    if ($error !== UPLOAD_ERR_OK || !is_uploaded_file($archivo['tmp_name'])) {
        throw new InvalidArgumentException('No se recibió la imagen. Intenta de nuevo.');
    }

    $info = @getimagesize($archivo['tmp_name']);
    $formato = $info[2] ?? null;
    if (!isset(IMAGEN_FORMATOS[$formato])) {
        throw new InvalidArgumentException('Formato no permitido: usa JPG, PNG, WebP o GIF.');
    }

    $nombre = bin2hex(random_bytes(16)) . '.' . IMAGEN_FORMATOS[$formato];
    $destino = carpeta_uploads() . '/' . $nombre;

    if (!reducir_imagen($archivo['tmp_name'], $destino, $formato, $ladoMaximo)
        && !move_uploaded_file($archivo['tmp_name'], $destino)) {
        throw new RuntimeException('No se pudo guardar la imagen en backend/uploads (¿permisos de escritura?).');
    }

    return 'backend/uploads/' . $nombre;
}

/** Reduce y vuelve a codificar la imagen con GD. Devuelve false si no se puede (sin GD, GIF animado...). */
function reducir_imagen(string $origen, string $destino, int $formato, int $ladoMaximo): bool {
    if ($formato === IMAGETYPE_GIF || !function_exists('imagecreatetruecolor')) {
        return false;
    }

    $imagen = match ($formato) {
        IMAGETYPE_JPEG => @imagecreatefromjpeg($origen),
        IMAGETYPE_PNG => @imagecreatefrompng($origen),
        IMAGETYPE_WEBP => function_exists('imagecreatefromwebp') ? @imagecreatefromwebp($origen) : false,
        default => false,
    };
    if (!$imagen) {
        return false;
    }

    // Las fotos de celular guardan su orientación en EXIF; al volver a codificar se perdería.
    if ($formato === IMAGETYPE_JPEG && function_exists('exif_read_data')) {
        $giro = [3 => 180, 6 => -90, 8 => 90][@exif_read_data($origen)['Orientation'] ?? 1] ?? 0;
        if ($giro) {
            $imagen = imagerotate($imagen, $giro, 0);
        }
    }

    $ancho = imagesx($imagen);
    $alto = imagesy($imagen);
    $escala = min(1, $ladoMaximo / max($ancho, $alto));
    $nuevoAncho = max(1, (int) round($ancho * $escala));
    $nuevoAlto = max(1, (int) round($alto * $escala));

    $lienzo = imagecreatetruecolor($nuevoAncho, $nuevoAlto);
    imagealphablending($lienzo, false);
    imagesavealpha($lienzo, true);
    imagecopyresampled($lienzo, $imagen, 0, 0, 0, 0, $nuevoAncho, $nuevoAlto, $ancho, $alto);

    return match ($formato) {
        IMAGETYPE_JPEG => imagejpeg($lienzo, $destino, 82),
        IMAGETYPE_PNG => imagepng($lienzo, $destino, 6),
        IMAGETYPE_WEBP => imagewebp($lienzo, $destino, 82),
    };
}

/** ¿Es una ruta de imagen aceptable para guardar en la BD? ('' = sin imagen) */
function ruta_imagen_valida(string $ruta): bool {
    return $ruta === ''
        || (preg_match('~^(backend/uploads|images)/[A-Za-z0-9._/-]+$~', $ruta) && !str_contains($ruta, '..'));
}

/** ¿La usa algún producto o algún dato del sitio? */
function imagen_en_uso(string $ruta): bool {
    $consulta = db()->prepare('
        SELECT (SELECT COUNT(*) FROM fotos WHERE ubicacion = ?)
             + (SELECT COUNT(*) FROM configuracion WHERE valor = ?)
    ');
    $consulta->execute([$ruta, $ruta]);
    return (int) $consulta->fetchColumn() > 0;
}

/**
 * Borra una imagen subida por el panel. Solo actúa sobre archivos sueltos de
 * backend/uploads: ignora cualquier otra ruta y las fotos de ejemplo (uploads/demo).
 */
function borrar_imagen(string $ruta): void {
    $nombre = basename($ruta);
    if ($ruta !== 'backend/uploads/' . $nombre || $nombre[0] === '.') {
        return;
    }
    $archivo = carpeta_uploads() . '/' . $nombre;
    if (is_file($archivo)) {
        unlink($archivo);
    }
}
